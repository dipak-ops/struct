import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'app_database.g.dart';

class Identities extends Table {
  TextColumn get id => text()();
  TextColumn get displayName => text()();
  TextColumn get publicKey => text()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  IntColumn get verificationStatus => integer().withDefault(const Constant(0))();

  @override
  Set<Column> get primaryKey => {id};
}

class Peers extends Table {
  TextColumn get peerId => text()();
  TextColumn get displayName => text()();
  TextColumn get publicKey => text()();
  DateTimeColumn get lastSeen => dateTime()();
  IntColumn get signalStrength => integer()();
  IntColumn get connectionState => integer()();
  BoolColumn get isVerified => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {peerId};
}

class Messages extends Table {
  TextColumn get messageId => text()();
  TextColumn get senderId => text()();
  TextColumn get recipientId => text()();
  TextColumn get channelId => text()();
  BlobColumn get encryptedPayload => blob()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get expiresAt => dateTime().nullable()();
  IntColumn get ttl => integer()();
  IntColumn get status => integer()(); // 0:queued, 1:sending, 2:relayed, 3:delivered, 4:read, 5:failed

  @override
  Set<Column> get primaryKey => {messageId};
}

class PendingMessages extends Table {
  TextColumn get messageId => text()();
  TextColumn get destinationId => text()();
  BlobColumn get rawPacket => blob()();
  DateTimeColumn get nextAttemptAt => dateTime()();
  IntColumn get attemptCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get expiresAt => dateTime()();

  @override
  Set<Column> get primaryKey => {messageId};
}

class Channels extends Table {
  TextColumn get channelId => text()();
  TextColumn get name => text()();
  IntColumn get type => integer()(); // 0: public, 1: private, 2: emergency
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {channelId};
}

class MessageReceipts extends Table {
  TextColumn get messageId => text()();
  TextColumn get peerId => text()();
  IntColumn get status => integer()();
  DateTimeColumn get timestamp => dateTime()();

  @override
  Set<Column> get primaryKey => {messageId, peerId};
}

@DriftDatabase(tables: [
  Identities,
  Peers,
  Messages,
  PendingMessages,
  Channels,
  MessageReceipts,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
    },
    beforeOpen: (details) async {
      await customStatement('PRAGMA foreign_keys = ON');
      await customStatement('PRAGMA journal_mode = WAL');
    },
  );
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'struct_mesh.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
