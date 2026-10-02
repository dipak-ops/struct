# Struct — Production ProGuard & R8 Optimization Rules

# Preserve Struct core package
-keep class com.struct.app.** { *; }

# Preserve Cryptography & Hardware Key Enclave primitives
-keep class com.cryptography.** { *; }
-keep class androidx.security.crypto.** { *; }

# Preserve Drift SQLite native bindings
-keep class androidx.room.** { *; }
-keep class org.sqlite.** { *; }

# Suppress harmless warnings from dependencies
-dontwarn okio.**
-dontwarn java.lang.invoke.**
