/// Strongly Typed Domain Errors for Struct Mesh
/// Author: Dipak Bhondekar

sealed class StructError implements Exception {
  final String message;
  final String? code;
  final dynamic cause;

  const StructError(this.message, {this.code, this.cause});

  @override
  String toString() => '$runtimeType: $message${code != null ? ' (Code: $code)' : ''}';
}

class BleError extends StructError {
  const BleError(super.message, {super.code, super.cause});
}

class PacketValidationError extends StructError {
  const PacketValidationError(super.message, {super.code, super.cause});
}

class SecurityError extends StructError {
  const SecurityError(super.message, {super.code, super.cause});
}

class DecryptionError extends SecurityError {
  const DecryptionError(super.message, {super.code, super.cause});
}

class SessionError extends SecurityError {
  const SessionError(super.message, {super.code, super.cause});
}

class RoutingError extends StructError {
  const RoutingError(super.message, {super.code, super.cause});
}

class StorageError extends StructError {
  const StorageError(super.message, {super.code, super.cause});
}

class PeerError extends StructError {
  const PeerError(super.message, {super.code, super.cause});
}
