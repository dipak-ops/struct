package com.struct.app

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Build
import android.os.IBinder
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

/**
 * MainActivity for Struct Android.
 * Connects Flutter Dart MethodChannel & EventChannel to BleService.
 * Author: Dipak Bhondekar
 */
class MainActivity : FlutterActivity(), BleService.BleEventListener {
    private val METHOD_CHANNEL = "com.struct.app/ble_mesh"
    private val EVENT_CHANNEL = "com.struct.app/ble_events"

    private var bleService: BleService? = null
    private var isBound = false
    private var eventSink: EventChannel.EventSink? = null

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as? BleService.LocalBinder
            bleService = binder?.getService()
            bleService?.setEventListener(this@MainActivity)
            isBound = true
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            bleService?.setEventListener(null)
            bleService = null
            isBound = false
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Event Channel for asynchronous BLE streams (peers, connection changes, raw incoming bytes)
        EventChannel(flutterEngine.dartExecutor.binaryMessenger, EVENT_CHANNEL).setStreamHandler(
            object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    eventSink = events
                }

                override fun onCancel(arguments: Any?) {
                    eventSink = null
                }
            }
        )

        // Method Channel for commands
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, METHOD_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "startMeshService" -> {
                    val intent = Intent(this, BleService::class.java)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(intent)
                    } else {
                        startService(intent)
                    }
                    bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
                    result.success(true)
                }

                "stopMeshService" -> {
                    if (isBound) {
                        unbindService(serviceConnection)
                        isBound = false
                    }
                    val intent = Intent(this, BleService::class.java)
                    stopService(intent)
                    result.success(true)
                }

                "connectPeer" -> {
                    val address = call.argument<String>("address")
                    if (address != null && bleService != null) {
                        val ok = bleService!!.connectPeer(address)
                        result.success(ok)
                    } else {
                        result.error("INVALID_ARGS", "Missing address or service not ready", null)
                    }
                }

                "disconnectPeer" -> {
                    val address = call.argument<String>("address")
                    if (address != null) {
                        bleService?.disconnectPeer(address)
                        result.success(true)
                    } else {
                        result.error("INVALID_ARGS", "Missing address", null)
                    }
                }

                "sendData" -> {
                    val address = call.argument<String>("address")
                    val data = call.argument<ByteArray>("data")
                    if (address != null && data != null && bleService != null) {
                        bleService!!.sendData(address, data) { success ->
                            result.success(success)
                        }
                    } else {
                        result.error("INVALID_ARGS", "Missing address/data or service not ready", null)
                    }
                }

                "getConnectedPeers" -> {
                    val peers = bleService?.getConnectedPeers() ?: emptyList<String>()
                    result.success(peers)
                }

                "getDeviceMtu" -> {
                    val address = call.argument<String>("address")
                    val mtu = if (address != null) bleService?.getDeviceMtu(address) ?: 23 else 23
                    result.success(mtu)
                }

                else -> result.notImplemented()
            }
        }
    }

    // ------------------------------------------------------------------------
    // BleService.BleEventListener Implementation
    // ------------------------------------------------------------------------
    override fun onPeerDiscovered(address: String, name: String?, rssi: Int) {
        val map = mapOf(
            "type" to "peerDiscovered",
            "address" to address,
            "name" to (name ?: "Unknown"),
            "rssi" to rssi
        )
        runOnUiThread { eventSink?.success(map) }
    }

    override fun onConnectionStateChange(address: String, connected: Boolean) {
        val map = mapOf(
            "type" to "connectionStateChange",
            "address" to address,
            "connected" to connected
        )
        runOnUiThread { eventSink?.success(map) }
    }

    override fun onDataReceived(address: String, data: ByteArray) {
        val map = mapOf(
            "type" to "dataReceived",
            "address" to address,
            "data" to data
        )
        runOnUiThread { eventSink?.success(map) }
    }

    override fun onMtuChanged(address: String, mtu: Int) {
        val map = mapOf(
            "type" to "mtuChanged",
            "address" to address,
            "mtu" to mtu
        )
        runOnUiThread { eventSink?.success(map) }
    }

    override fun onDestroy() {
        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
        super.onDestroy()
    }
}
