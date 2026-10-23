package com.struct.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.content.Intent
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.ParcelUuid
import android.util.Log
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Production-hardened Android BLE Mesh Service for Struct.
 * Author: Dipak Bhondekar
 * 
 * Supports simultaneous Central (GATT Client) and Peripheral (GATT Server + Advertiser)
 * roles with serialized async write queues, MTU negotiation, and CCCD notification handling.
 */
class BleService : Service() {
    companion object {
        const val TAG = "StructBleService"
        const val CHANNEL_ID = "struct_mesh_channel"
        val SERVICE_UUID: UUID = UUID.fromString("00005752-5543-5400-8000-00805F9B34FB")
        val RX_CHAR_UUID: UUID = UUID.fromString("00005752-5543-5401-8000-00805F9B34FB")
        val TX_CHAR_UUID: UUID = UUID.fromString("00005752-5543-5402-8000-00805F9B34FB")
        val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805F9B34FB")

        var instance: BleService? = null
            private set
    }

    interface BleEventListener {
        fun onPeerDiscovered(address: String, name: String?, rssi: Int)
        fun onConnectionStateChange(address: String, connected: Boolean)
        fun onDataReceived(address: String, data: ByteArray)
        fun onMtuChanged(address: String, mtu: Int)
    }

    private var eventListener: BleEventListener? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    private var bluetoothManager: BluetoothManager? = null
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bleAdvertiser: BluetoothLeAdvertiser? = null
    private var bleScanner: BluetoothLeScanner? = null
    private var gattServer: BluetoothGattServer? = null

    // Track active client connections
    private val activeGattClients = ConcurrentHashMap<String, BluetoothGatt>()
    private val clientMtuMap = ConcurrentHashMap<String, Int>()

    // Serialized write queues per device to prevent BLE stack collision
    private data class WriteJob(
        val address: String,
        val data: ByteArray,
        val callback: (Boolean) -> Unit
    )
    private val writeQueue = ConcurrentLinkedQueue<WriteJob>()
    @Volatile private var isWriting = false

    inner class LocalBinder : Binder() {
        fun getService(): BleService = this@BleService
    }
    private val binder = LocalBinder()

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannel()
        startForeground(1001, buildNotification())
        initializeBluetooth()
    }

    fun setEventListener(listener: BleEventListener?) {
        this.eventListener = listener
    }

    private fun initializeBluetooth() {
        bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bluetoothAdapter = bluetoothManager?.adapter

        if (bluetoothAdapter != null && bluetoothAdapter!!.isEnabled) {
            setupGattServer()
            startAdvertising()
            startScanning()
        } else {
            Log.w(TAG, "Bluetooth is disabled or unsupported on this device")
        }
    }

    // ------------------------------------------------------------------------
    // Peripheral Role: GATT Server & Advertising
    // ------------------------------------------------------------------------
    private fun setupGattServer() {
        try {
            gattServer = bluetoothManager?.openGattServer(this, object : BluetoothGattServerCallback() {
                override fun onConnectionStateChange(device: BluetoothDevice?, status: Int, newState: Int) {
                    val address = device?.address ?: return
                    val connected = newState == BluetoothProfile.STATE_CONNECTED
                    Log.i(TAG, "GATT Server connection change from $address: connected=$connected")
                    mainHandler.post {
                        eventListener?.onConnectionStateChange(address, connected)
                    }
                }

                override fun onCharacteristicWriteRequest(
                    device: BluetoothDevice?,
                    requestId: Int,
                    characteristic: BluetoothGattCharacteristic?,
                    preparedWrite: Boolean,
                    responseNeeded: Boolean,
                    offset: Int,
                    value: ByteArray?
                ) {
                    if (characteristic?.uuid == RX_CHAR_UUID && value != null) {
                        val address = device?.address ?: "unknown"
                        Log.d(TAG, "GATT Server received ${value.size} bytes from $address")
                        mainHandler.post {
                            eventListener?.onDataReceived(address, value)
                        }
                    }

                    if (responseNeeded && device != null) {
                        try {
                            gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null)
                        } catch (e: SecurityException) {
                            Log.e(TAG, "Permission error sending GATT response", e)
                        }
                    }
                }

                override fun onDescriptorWriteRequest(
                    device: BluetoothDevice?,
                    requestId: Int,
                    descriptor: BluetoothGattDescriptor?,
                    preparedWrite: Boolean,
                    responseNeeded: Boolean,
                    offset: Int,
                    value: ByteArray?
                ) {
                    if (descriptor?.uuid == CCCD_UUID && device != null) {
                        descriptor.value = value
                        if (responseNeeded) {
                            try {
                                gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null)
                            } catch (e: SecurityException) {
                                Log.e(TAG, "Permission error on descriptor write", e)
                            }
                        }
                    }
                }
            })

            val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
            val rxChar = BluetoothGattCharacteristic(
                RX_CHAR_UUID,
                BluetoothGattCharacteristic.PROPERTY_WRITE or BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE,
                BluetoothGattCharacteristic.PERMISSION_WRITE
            )
            val txChar = BluetoothGattCharacteristic(
                TX_CHAR_UUID,
                BluetoothGattCharacteristic.PROPERTY_NOTIFY or BluetoothGattCharacteristic.PROPERTY_READ,
                BluetoothGattCharacteristic.PERMISSION_READ
            )
            val cccd = BluetoothGattDescriptor(
                CCCD_UUID,
                BluetoothGattDescriptor.PERMISSION_READ or BluetoothGattDescriptor.PERMISSION_WRITE
            )
            txChar.addDescriptor(cccd)

            service.addCharacteristic(rxChar)
            service.addCharacteristic(txChar)
            gattServer?.addService(service)
        } catch (e: SecurityException) {
            Log.e(TAG, "Missing Bluetooth permissions to start GATT server", e)
        }
    }

    fun startAdvertising() {
        val adapter = bluetoothAdapter ?: return
        if (!adapter.isEnabled) return
        bleAdvertiser = adapter.bluetoothLeAdvertiser

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
            .setConnectable(true)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .addServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()

        try {
            bleAdvertiser?.startAdvertising(settings, data, object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                    Log.i(TAG, "BLE Advertising started for Struct Service")
                }
                override fun onStartFailure(errorCode: Int) {
                    Log.e(TAG, "BLE Advertising failed with error code: $errorCode")
                }
            })
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException while starting BLE advertising", e)
        }
    }

    // ------------------------------------------------------------------------
    // Central Role: Scanning & GATT Client Connections
    // ------------------------------------------------------------------------
    fun startScanning() {
        val adapter = bluetoothAdapter ?: return
        if (!adapter.isEnabled) return
        bleScanner = adapter.bluetoothLeScanner

        val filter = ScanFilter.Builder()
            .setServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_BALANCED)
            .build()

        try {
            bleScanner?.startScan(listOf(filter), settings, scanCallback)
            Log.i(TAG, "BLE scanning started")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException while starting BLE scan", e)
        }
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result?.device?.let { device ->
                val address = device.address
                val name = try { device.name } catch (_: SecurityException) { null }
                val rssi = result.rssi
                mainHandler.post {
                    eventListener?.onPeerDiscovered(address, name, rssi)
                }
            }
        }

        override fun onScanFailed(errorCode: Int) {
            Log.e(TAG, "Scan failed with error: $errorCode")
        }
    }

    fun connectPeer(address: String): Boolean {
        val adapter = bluetoothAdapter ?: return false
        try {
            val device = adapter.getRemoteDevice(address) ?: return false
            if (activeGattClients.containsKey(address)) {
                return true // Already connected or connecting
            }

            val gatt = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                device.connectGatt(this, false, gattClientCallback, BluetoothDevice.TRANSPORT_LE)
            } else {
                device.connectGatt(this, false, gattClientCallback)
            }
            activeGattClients[address] = gatt
            return true
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException connecting to $address", e)
            return false
        }
    }

    fun disconnectPeer(address: String) {
        val gatt = activeGattClients.remove(address) ?: return
        try {
            gatt.disconnect()
            gatt.close()
        } catch (e: SecurityException) {
            Log.e(TAG, "Error disconnecting $address", e)
        }
    }

    private val gattClientCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
            val address = gatt?.device?.address ?: return
            val connected = newState == BluetoothProfile.STATE_CONNECTED
            Log.i(TAG, "GATT Client connection changed for $address: connected=$connected (status=$status)")

            if (connected) {
                try {
                    // Negotiate larger MTU for faster throughput
                    gatt.requestMtu(512)
                } catch (e: SecurityException) {
                    Log.e(TAG, "Error requesting MTU", e)
                }
            } else {
                activeGattClients.remove(address)
                clientMtuMap.remove(address)
                try {
                    gatt.close()
                } catch (_: SecurityException) {}
            }

            mainHandler.post {
                eventListener?.onConnectionStateChange(address, connected)
            }
        }

        override fun onMtuChanged(gatt: BluetoothGatt?, mtu: Int, status: Int) {
            val address = gatt?.device?.address ?: return
            Log.i(TAG, "MTU changed for $address to $mtu (status=$status)")
            clientMtuMap[address] = mtu
            mainHandler.post {
                eventListener?.onMtuChanged(address, mtu)
            }
            // Once MTU is negotiated, discover services
            try {
                gatt?.discoverServices()
            } catch (e: SecurityException) {
                Log.e(TAG, "Error discovering services", e)
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
            val address = gatt?.device?.address ?: return
            if (status == BluetoothGatt.GATT_SUCCESS && gatt != null) {
                val service = gatt.getService(SERVICE_UUID)
                val txChar = service?.getCharacteristic(TX_CHAR_UUID)
                if (txChar != null) {
                    try {
                        gatt.setCharacteristicNotification(txChar, true)
                        val descriptor = txChar.getDescriptor(CCCD_UUID)
                        if (descriptor != null) {
                            descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                            gatt.writeDescriptor(descriptor)
                            Log.i(TAG, "Subscribed to TX notifications on $address")
                        }
                    } catch (e: SecurityException) {
                        Log.e(TAG, "Error subscribing to notifications on $address", e)
                    }
                }
            }
        }

        override fun onCharacteristicChanged(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?) {
            val address = gatt?.device?.address ?: return
            val value = characteristic?.value ?: return
            if (characteristic.uuid == TX_CHAR_UUID) {
                Log.d(TAG, "Received ${value.size} bytes from $address via notify")
                mainHandler.post {
                    eventListener?.onDataReceived(address, value)
                }
            }
        }

        override fun onCharacteristicWrite(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?, status: Int) {
            isWriting = false
            processNextWrite()
        }
    }

    // ------------------------------------------------------------------------
    // Serialized Outbound Write Queue
    // ------------------------------------------------------------------------
    fun sendData(address: String, data: ByteArray, callback: (Boolean) -> Unit) {
        writeQueue.add(WriteJob(address, data, callback))
        processNextWrite()
    }

    @Synchronized
    private fun processNextWrite() {
        if (isWriting || writeQueue.isEmpty()) return

        val job = writeQueue.poll() ?: return
        val gatt = activeGattClients[job.address]
        if (gatt == null) {
            job.callback(false)
            processNextWrite()
            return
        }

        val service = gatt.getService(SERVICE_UUID)
        val rxChar = service?.getCharacteristic(RX_CHAR_UUID)
        if (rxChar == null) {
            job.callback(false)
            processNextWrite()
            return
        }

        try {
            rxChar.value = job.data
            rxChar.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
            val success = gatt.writeCharacteristic(rxChar)
            if (success) {
                isWriting = true
                job.callback(true)
            } else {
                job.callback(false)
                processNextWrite()
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Error writing to characteristic", e)
            job.callback(false)
            processNextWrite()
        }
    }

    fun getConnectedPeers(): List<String> = activeGattClients.keys().toList()

    fun getDeviceMtu(address: String): Int = clientMtuMap[address] ?: 23

    // ------------------------------------------------------------------------
    // Lifecycle & Notifications
    // ------------------------------------------------------------------------
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Struct Offline Mesh",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the decentralized offline BLE mesh connected"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            Notification.Builder(this)
        }
        return builder
            .setContentTitle("Struct Mesh Active")
            .setContentText("Relaying offline encrypted packets nearby")
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onDestroy() {
        try {
            bleScanner?.stopScan(scanCallback)
            bleAdvertiser?.stopAdvertising(object : AdvertiseCallback() {})
            gattServer?.close()
            activeGattClients.values.forEach { it.close() }
            activeGattClients.clear()
        } catch (_: SecurityException) {}
        instance = null
        super.onDestroy()
    }
}
