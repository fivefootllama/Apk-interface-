# Keep the accessibility bridge: Python (Chaquopy) calls it by name via reflection.
-keep class com.example.container.SystemBridgeService { *; }
-keep class com.example.container.SystemBridgeService$Companion { *; }
