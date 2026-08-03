# R8 rules for release builds.
#
# Release enables minification and resource shrinking, so anything reached only
# through reflection or JNI has to be kept explicitly.

# --- React Native core -------------------------------------------------------
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.jni.** { *; }
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class * { @com.facebook.react.bridge.ReactMethod <methods>; }
-dontwarn com.facebook.react.**

# --- Hermes ------------------------------------------------------------------
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Expo modules ------------------------------------------------------------
-keep class expo.modules.** { *; }
-keepclassmembers class * { @expo.modules.core.interfaces.ExpoMethod <methods>; }
-dontwarn expo.modules.**

# --- react-native-maps / Google Maps SDK -------------------------------------
# The Maps SDK resolves renderer classes reflectively. Stripping them is the
# usual cause of a map that renders as a blank grey canvas in release only.
-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.maps.android.** { *; }
-keep class com.rnmaps.maps.** { *; }
-dontwarn com.google.android.gms.**

# --- AsyncStorage ------------------------------------------------------------
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# --- OkHttp / Okio (networking used by fetch and the image loader) -----------
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Keep source line numbers so release crash reports stay readable.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
