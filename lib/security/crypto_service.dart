import 'dart:typed_data';
import 'package:cryptography/cryptography.dart';

abstract class CryptoService {
  Future<SimpleKeyPair> generateIdentityKeyPair();
  Future<SimplePublicKey> getPublicIdentity(SimpleKeyPair keyPair);
  Future<SecretKey> deriveSessionKey({
    required KeyPair myEphemeralKey,
    required PublicKey peerStaticKey,
  });
  Future<Uint8List> encryptPayload({
    required Uint8List plaintext,
    required SecretKey sessionKey,
    required Uint8List nonce,
  });
  Future<Uint8List> decryptPayload({
    required Uint8List ciphertext,
    required SecretKey sessionKey,
    required Uint8List nonce,
    required Uint8List mac,
  });
  Future<Signature> sign({
    required Uint8List data,
    required KeyPair signingKey,
  });
  Future<bool> verifySignature({
    required Uint8List data,
    required Signature signature,
    required PublicKey publicKey,
  });
}

class StandardCryptoService implements CryptoService {
  final Ed25519 _ed25519 = Ed25519();
  final X25519 _x25519 = X25519();
  final Chacha20.poly1305Aead() _aead = Chacha20.poly1305Aead();

  @override
  Future<SimpleKeyPair> generateIdentityKeyPair() async {
    return await _ed25519.newKeyPair();
  }

  @override
  Future<SimplePublicKey> getPublicIdentity(SimpleKeyPair keyPair) async {
    return await keyPair.extractPublicKey();
  }

  @override
  Future<SecretKey> deriveSessionKey({
    required KeyPair myEphemeralKey,
    required PublicKey peerStaticKey,
  }) async {
    final sharedSecret = await _x25519.sharedSecretKey(
      keyPair: myEphemeralKey,
      remotePublicKey: peerStaticKey,
    );
    final hkdf = Hkdf(
      hmac: Hmac.sha256(),
      outputLength: 32,
    );
    return await hkdf.deriveKey(
      secretKey: sharedSecret,
      info: Uint8List.fromList('Struct-Session-v1'.codeUnits),
    );
  }

  @override
  Future<Uint8List> encryptPayload({
    required Uint8List plaintext,
    required SecretKey sessionKey,
    required Uint8List nonce,
  }) async {
    final secretBox = await _aead.encrypt(
      plaintext,
      secretKey: sessionKey,
      nonce: nonce,
    );
    final combined = Uint8List(secretBox.cipherText.length + secretBox.mac.bytes.length);
    combined.setAll(0, secretBox.cipherText);
    combined.setAll(secretBox.cipherText.length, secretBox.mac.bytes);
    return combined;
  }

  @override
  Future<Uint8List> decryptPayload({
    required Uint8List ciphertext,
    required SecretKey sessionKey,
    required Uint8List nonce,
    required Uint8List mac,
  }) async {
    final secretBox = SecretBox(
      ciphertext,
      nonce: nonce,
      mac: Mac(mac),
    );
    final decrypted = await _aead.decrypt(
      secretBox,
      secretKey: sessionKey,
    );
    return Uint8List.fromList(decrypted);
  }

  @override
  Future<Signature> sign({
    required Uint8List data,
    required KeyPair signingKey,
  }) async {
    return await _ed25519.sign(data, keyPair: signingKey);
  }

  @override
  Future<bool> verifySignature({
    required Uint8List data,
    required Signature signature,
    required PublicKey publicKey,
  }) async {
    return await _ed25519.verify(data, signature: signature);
  }
}
