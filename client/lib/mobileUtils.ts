import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { Toast } from '@capacitor/toast';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative()) {
        try {
            await Haptics.impact({ style });
        } catch (error) {
            console.warn('Haptics not supported or failed:', error);
        }
    }
};

/**
 * Trigger selection haptic (light vibration)
 */
export const triggerSelectionHaptic = async () => {
    if (isNative()) {
        try {
            await Haptics.selectionStart();
            await Haptics.selectionEnd();
        } catch (error) {
            console.warn('Selection haptics failed:', error);
        }
    }
};

/**
 * Check if the app is running in a native environment (Android/iOS)
 */
export const isNative = () => {
    return Capacitor.isNativePlatform();
};

/**
 * Save a file to the device storage
 * @param fileName The name of the file to save
 * @param content The content of the file (string or base64)
 * @param encoding The encoding of the content (default: UTF8)
 */
export const saveFileNative = async (fileName: string, content: string, encoding: Encoding = Encoding.UTF8) => {
    if (!isNative()) {
        console.warn('saveFileNative called on non-native platform');
        return false;
    }

    try {
        // Check/Request permissions if needed (usually public folders on modern Android)
        // For now, we save to the Documents directory which is usually safe
        const result = await Filesystem.writeFile({
            path: fileName,
            data: content,
            directory: Directory.Documents,
            encoding: encoding,
            recursive: true
        });

        await Toast.show({
            text: `File saved to Documents: ${fileName}`,
            duration: 'long'
        });

        console.log('File saved successfully:', result.uri);
        return true;
    } catch (error) {
        console.error('Error saving file native:', error);
        await Toast.show({
            text: `Failed to save file: ${fileName}`,
            duration: 'short'
        });
        return false;
    }
};

/**
 * Get current network status
 */
export const getNetworkStatus = async () => {
    return await Network.getStatus();
};

/**
 * Listen for network status changes
 * @param callback Callback function when status changes
 */
export const onNetworkStatusChange = (callback: (status: { connected: boolean; connectionType: string }) => void) => {
    return Network.addListener('networkStatusChange', callback);
};

/**
 * Show a native toast message
 */
export const showNativeToast = async (message: string) => {
    if (isNative()) {
        await Toast.show({
            text: message,
            duration: 'short'
        });
    } else {
        console.log('Native Toast (Simulated):', message);
    }
};

/**
 * Get device info
 */
export const getDeviceInfo = async () => {
    return await Device.getInfo();
};
