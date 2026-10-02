import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/errors.dart';

abstract class SecureKeyStore {
  Future<void> storePrivateKey(String alias, String privateKeyHex);
  Future<String?> getPrivateKey(String alias);
  Future<void> deleteKey(String alias);
  Future<void> clearAllKeys();
}

class PlatformSecureKeyStore implements SecureKeyStore {
  final FlutterSecureStorage _storage;

  PlatformSecureKeyStore({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
                keyCipherAlgorithm: KeyCipherAlgorithm.RSA_ECB_PKCS1Padding,
                storageCipherAlgorithm: StorageCipherAlgorithm.AES_GCM_NoPadding,
              ),
              iOptions: IOSOptions(
                accessibility: KeychainAccessibility.first_unlock_this_device,
              ),
            );

  @override
  Future<void> storePrivateKey(String alias, String privateKeyHex) async {
    try {
      await _storage.write(key: 'sec_key_$alias', value: privateKeyHex);
    } catch (e) {
      throw SecurityError('Failed to store private key in secure hardware enclave', cause: e);
    }
  }

  @override
  Future<String?> getPrivateKey(String alias) async {
    try {
      return await _storage.read(key: 'sec_key_$alias');
    } catch (e) {
      throw SecurityError('Failed to retrieve private key from secure hardware enclave', cause: e);
    }
  }

  @override
  Future<void> deleteKey(String alias) async {
    try {
      await _storage.delete(key: 'sec_key_$alias');
    } catch (e) {
      throw SecurityError('Failed to delete key from secure storage', cause: e);
    }
  }

  @override
  Future<void> clearAllKeys() async {
    try {
      await _storage.deleteAll();
    } catch (e) {
      throw SecurityError('Failed to clear secure key store', cause: e);
    }
  }
}
