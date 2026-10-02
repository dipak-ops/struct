import Foundation
import CoreBluetooth

final class BleCentralPeripheralManager: NSObject, CBCentralManagerDelegate, CBPeripheralManagerDelegate {
    static let shared = BleCentralPeripheralManager()

    let structServiceUUID = CBUUID(string: "00005752-5543-5400-8000-00805F9B34FB")
    let rxCharUUID = CBUUID(string: "00005752-5543-5401-8000-00805F9B34FB")
    let txCharUUID = CBUUID(string: "00005752-5543-5402-8000-00805F9B34FB")

    private var centralManager: CBCentralManager!
    private var peripheralManager: CBPeripheralManager!
    private var rxCharacteristic: CBMutableCharacteristic?

    override init() {
        super.init()
        centralManager = CBCentralManager(
            delegate: self,
            queue: nil,
            options: [CBCentralManagerOptionRestoreIdentifierKey: "struct_mesh_central"]
        )
        peripheralManager = CBPeripheralManager(
            delegate: self,
            queue: nil,
            options: [CBPeripheralManagerOptionRestoreIdentifierKey: "struct_mesh_peripheral"]
        )
    }

    // MARK: - CBCentralManagerDelegate
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn {
            central.scanForPeripherals(withServices: [structServiceUUID], options: [
                CBCentralManagerScanOptionAllowDuplicatesKey: false
            ])
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        // Discovered nearby Struct peer
        print("[Struct iOS] Discovered peer: \(peripheral.identifier.uuidString) RSSI: \(RSSI)")
        central.connect(peripheral, options: nil)
    }

    // MARK: - CBPeripheralManagerDelegate
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        if peripheral.state == .poweredOn {
            setupPeripheralService()
        }
    }

    private func setupPeripheralService() {
        let service = CBMutableService(type: structServiceUUID, primary: true)
        rxCharacteristic = CBMutableCharacteristic(
            type: rxCharUUID,
            properties: [.writeWithoutResponse, .write],
            value: nil,
            permissions: [.writeable]
        )
        service.characteristics = [rxCharacteristic!]
        peripheralManager.add(service)

        peripheralManager.startAdvertising([
            CBAdvertisementDataServiceUUIDsKey: [structServiceUUID],
            CBAdvertisementDataLocalNameKey: "StructNode"
        ])
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
        for request in requests {
            if request.characteristic.uuid == rxCharUUID, let value = request.value {
                // Inbound binary BLE fragment from peer
                print("[Struct iOS] Received \(value.count) bytes write from central")
                peripheral.respond(to: request, withResult: .success)
            }
        }
    }
}
