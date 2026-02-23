# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# ---- General Android / R8 ----
# Preserve line number information for crash stack traces.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ---- Capacitor / Cordova ----
# Keep all Capacitor-related classes intact (JS bridge relies on reflection)
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-dontwarn com.getcapacitor.**

# Keep any class that is referenced from a WebView / JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ---- Annotations ----
-keepattributes *Annotation*

# ---- Serialization / Reflection ----
# Parcelable implementations must keep their creator fields
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Gson / JSON serialization models (avoid stripping fields)
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ---- Native methods ----
-keepclasseswithmembernames class * {
    native <methods>;
}

# ---- Enums (needed for correct equals/hashCode) ----
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ---- Suppress harmless missing-class warnings from transitive dependencies ----
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn okhttp3.**
