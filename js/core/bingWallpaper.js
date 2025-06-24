/**
 * Bing Wallpaper Manager
 * Handles fetching, caching, and updating Bing daily wallpapers
 */
class BingWallpaperManager {
    constructor() {
        this.cacheKey = 'bing_wallpaper_cache';
        this.lastUpdateKey = 'bing_wallpaper_last_update';
        this.updateInterval = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        this.apiBaseUrl = 'https://api.bimg.cc';
        this.errorRetryDelay = 5000; // 5 seconds delay before retrying after 404
        this.maxRetries = 3; // Maximum number of retry attempts
    }

    /**
     * Initialize the Bing wallpaper manager
     */
    init() {
        console.log('BingWallpaperManager: Initializing...');
        
        // Check if it's a mobile device
        if (this.isMobileDevice()) {
            console.log('Bing wallpaper disabled on mobile devices');
            return;
        }
        
        console.log('BingWallpaperManager: Desktop/tablet device detected');
        
        // First, try to apply cached wallpaper immediately if available
        const cachedData = this.getCachedWallpaper();
        if (cachedData && cachedData.localUrl) {
            console.log('BingWallpaperManager: Applying cached wallpaper immediately');
            // Verify the cached image is still accessible
            this.verifyImageUrl(cachedData.localUrl)
                .then(isValid => {
                    if (isValid) {
                        this.applyWallpaper(cachedData.localUrl);
                    } else {
                        console.log('BingWallpaperManager: Cached image is no longer accessible, fetching new one');
                        this.fetchAndUpdateWallpaper();
                    }
                })
                .catch(() => {
                    console.log('BingWallpaperManager: Error verifying cached image, fetching new one');
                    this.fetchAndUpdateWallpaper();
                });
        } else {
            // No cached wallpaper, fetch new one
            this.fetchAndUpdateWallpaper();
        }
        
        // Then check if we should update the wallpaper
        if (this.shouldUpdate()) {
            console.log('BingWallpaperManager: Fetching new wallpaper in background...');
            this.fetchAndUpdateWallpaper();
        } else {
            console.log('BingWallpaperManager: Using cached wallpaper, no update needed');
        }
    }
    
    /**
     * Check if current device is a mobile phone
     * @returns {boolean}
     */
    isMobileDevice() {
        // Use the same logic as the main app
        if (typeof isMobileScreen === 'function') {
            return isMobileScreen();
        }
        
        // Fallback detection
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
        
        // Also check screen size - tablets typically have width >= 768px
        const screenWidth = window.screen.width;
        const isSmallScreen = screenWidth < 768;
        
        return isMobile && isSmallScreen;
    }

    /**
     * Check if we should update the wallpaper based on the last update time
     * @returns {boolean}
     */
    shouldUpdate() {
        const lastUpdate = localStorage.getItem(this.lastUpdateKey);
        if (!lastUpdate) return true;
        
        const timeSinceUpdate = Date.now() - parseInt(lastUpdate);
        return timeSinceUpdate > this.updateInterval;
    }
    
    /**
     * Verify if an image URL is still accessible
     * @param {string} url - The image URL to verify
     * @returns {Promise<boolean>} - Whether the image is accessible
     */
    async verifyImageUrl(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('BingWallpaperManager: Error verifying image URL:', error);
            return false;
        }
    }
    
    /**
     * Restore default backgrounds when all fetching attempts fail
     */
    restoreDefaultBackgrounds() {
        console.log('BingWallpaperManager: Restoring default system backgrounds');
        
        if (window.TL && window.TL.system_background) {
            // Restore default SVG backgrounds
            window.TL.system_background.light = ['/img/bg/light.svg'];
            window.TL.system_background.dark = ['/img/bg/dark.svg'];
            
            // Apply current theme's background
            const night = window.TL.matchNightModel();
            window.TL.bgLoadImg1(night);
        }
    }

    /**
     * Get cached wallpaper data
     * @returns {object|null}
     */
    getCachedWallpaper() {
        const cached = localStorage.getItem(this.cacheKey);
        if (!cached) return null;
        
        try {
            return JSON.parse(cached);
        } catch (e) {
            console.error('Failed to parse cached wallpaper data:', e);
            return null;
        }
    }

    /**
     * Cache wallpaper data
     * @param {object} data - Wallpaper data to cache
     */
    cacheWallpaper(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
            localStorage.setItem(this.lastUpdateKey, Date.now().toString());
        } catch (e) {
            console.error('Failed to cache wallpaper data:', e);
        }
    }

    /**
     * Get appropriate resolution based on screen size
     * @returns {object} {w: width, h: height}
     */
    getResolution() {
        const width = window.screen.width * window.devicePixelRatio;
        const height = window.screen.height * window.devicePixelRatio;
        
        // Common resolutions supported by the API
        const resolutions = [
            { w: 1920, h: 1200 },
            { w: 1920, h: 1080 },
            { w: 1366, h: 768 },
            { w: 1280, h: 720 },
            { w: 1024, h: 768 },
            { w: 800, h: 600 }
        ];
        
        // Find the best matching resolution
        let bestMatch = resolutions[0];
        for (const res of resolutions) {
            if (width <= res.w && height <= res.h) {
                bestMatch = res;
                break;
            }
        }
        
        // Check if we should use UHD
        const uhd = width > 1920 || height > 1200;
        
        return { w: bestMatch.w, h: bestMatch.h, uhd };
    }

    /**
     * Fetch wallpaper data from Bing API
     * @param {number} retryCount - Current retry attempt count
     * @returns {Promise<object>}
     */
    async fetchBingWallpaper(retryCount = 0) {
        try {
            const resolution = this.getResolution();
            
            // Build URL with parameters
            const params = new URLSearchParams({
                w: resolution.w,
                h: resolution.h,
                mkt: 'zh-CN'
            });
            
            if (resolution.uhd) {
                params.append('uhd', 'true');
            }
            
            const imageUrl = `${this.apiBaseUrl}/today?${params}`;
            
            // Test if the image is accessible
            console.log(`BingWallpaperManager: Fetching Bing wallpaper (attempt ${retryCount + 1}/${this.maxRetries + 1})`);
            const testResponse = await fetch(imageUrl, { method: 'HEAD' });
            
            if (!testResponse.ok) {
                console.warn(`BingWallpaperManager: Image fetch returned status ${testResponse.status}`);
                
                if ((testResponse.status === 404 || testResponse.status >= 500) && retryCount < this.maxRetries) {
                    // For 404 and 5xx errors, retry after delay
                    console.log(`BingWallpaperManager: Retrying in ${this.errorRetryDelay/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.errorRetryDelay));
                    return this.fetchBingWallpaper(retryCount + 1);
                }
                
                throw new Error(`Image not accessible: ${testResponse.status}`);
            }
            
            return {
                url: imageUrl,
                title: 'Bing Daily Wallpaper',
                copyright: '',
                date: new Date().toISOString()
            };
        } catch (error) {
            console.error(`BingWallpaperManager: Failed to fetch Bing wallpaper (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, error);
            
            if (retryCount < this.maxRetries) {
                // Try again with exponential backoff
                const backoffDelay = this.errorRetryDelay * Math.pow(1.5, retryCount);
                console.log(`BingWallpaperManager: Retrying in ${backoffDelay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return this.fetchBingWallpaper(retryCount + 1);
            }
            
            // All retries failed, try random wallpaper as fallback
            console.log('BingWallpaperManager: Max retries reached, switching to random wallpaper');
            return this.fetchRandomWallpaper();
        }
    }

    /**
     * Fetch random wallpaper as fallback
     * @param {number} retryCount - Current retry attempt count
     * @returns {Promise<object>}
     */
    async fetchRandomWallpaper(retryCount = 0) {
        try {
            const resolution = this.getResolution();
            
            // Build URL with parameters for random wallpaper
            const params = new URLSearchParams({
                w: resolution.w,
                h: resolution.h
            });
            
            if (resolution.uhd) {
                params.append('uhd', 'true');
            }
            
            const imageUrl = `${this.apiBaseUrl}/random?${params}`;
            
            // Verify the image is accessible
            console.log(`BingWallpaperManager: Fetching random wallpaper (attempt ${retryCount + 1}/${this.maxRetries + 1})`);
            const testResponse = await fetch(imageUrl, { method: 'HEAD' });
            
            if (!testResponse.ok) {
                console.warn(`BingWallpaperManager: Random image fetch returned status ${testResponse.status}`);
                
                if ((testResponse.status === 404 || testResponse.status >= 500) && retryCount < this.maxRetries) {
                    // For 404 and 5xx errors, retry after delay
                    console.log(`BingWallpaperManager: Retrying random wallpaper in ${this.errorRetryDelay/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.errorRetryDelay));
                    return this.fetchRandomWallpaper(retryCount + 1);
                }
                
                throw new Error(`Random image not accessible: ${testResponse.status}`);
            }
            
            return {
                url: imageUrl,
                title: 'Bing Random Wallpaper',
                copyright: '',
                date: new Date().toISOString()
            };
        } catch (error) {
            console.error(`BingWallpaperManager: Random wallpaper fetch failed (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, error);
            
            if (retryCount < this.maxRetries) {
                // Try again with exponential backoff
                const backoffDelay = this.errorRetryDelay * Math.pow(1.5, retryCount);
                console.log(`BingWallpaperManager: Retrying random wallpaper in ${backoffDelay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return this.fetchRandomWallpaper(retryCount + 1);
            }
            
            // All retries failed
            console.error('BingWallpaperManager: All random wallpaper fetch attempts failed');
            return null;
        }
    }

    /**
     * Download and cache the wallpaper image
     * @param {string} url - Image URL
     * @returns {Promise<string>} - Image URL (direct use)
     */
    async downloadImage(url) {
        // Since api.bimg.cc supports CORS, we can use the URL directly
        // No need to download and create blob URLs
        return url;
    }

    /**
     * Apply wallpaper to the background
     * @param {string} imageUrl - URL of the wallpaper image
     */
    applyWallpaper(imageUrl) {
        console.log('BingWallpaperManager: Applying wallpaper:', imageUrl);
        
        // Check if TL is available
        if (!window.TL) {
            console.log('BingWallpaperManager: TL not available yet, retrying in 1 second');
            setTimeout(() => this.applyWallpaper(imageUrl), 1000);
            return;
        }
        
        // Check if user has custom wallpaper set
        if (window.TL.mybg_light !== 0 || window.TL.mybg_dark !== 0) {
            console.log('BingWallpaperManager: User has custom wallpaper, skipping Bing wallpaper');
            return;
        }
        
        // Check if we're currently using default SVG backgrounds
        const currentLight = window.TL.system_background.light[0];
        const currentDark = window.TL.system_background.dark[0];
        const isUsingDefaultBg = currentLight && currentLight.includes('/img/bg/') && currentLight.endsWith('.svg');
        
        if (!isUsingDefaultBg) {
            console.log('BingWallpaperManager: Not using default background, skipping replacement');
            return;
        }
        
        console.log('BingWallpaperManager: Replacing default SVG backgrounds with Bing wallpaper');
        
        // Store original backgrounds if not already stored
        if (!this.originalBackgrounds) {
            this.originalBackgrounds = {
                light: [...window.TL.system_background.light],
                dark: [...window.TL.system_background.dark]
            };
            console.log('BingWallpaperManager: Stored original backgrounds:', this.originalBackgrounds);
        }
        
        // Preload the image first, then apply with fadeIn effect
        this.preloadAndApplyImage(imageUrl);
    }
    
    /**
     * Preload image and apply with fadeIn effect
     * @param {string} imageUrl - URL of the image to preload and apply
     * @param {number} retryCount - Current retry attempt count
     */
    preloadAndApplyImage(imageUrl, retryCount = 0) {
        console.log('BingWallpaperManager: Preloading image:', imageUrl);
        
        // Create a new image element to preload
        const img = new Image();
        
        img.onload = () => {
            console.log('BingWallpaperManager: Image loaded successfully, applying with fadeIn');
            
            // Update system backgrounds
            if (window.TL && window.TL.system_background) {
                window.TL.system_background.light = [imageUrl];
                window.TL.system_background.dark = [imageUrl];
                console.log('BingWallpaperManager: Updated system backgrounds');
                
                // Apply the wallpaper with fadeIn effect
                this.applyWithFadeIn(imageUrl);
                
                // Cache the successfully loaded image data
                const cachedData = this.getCachedWallpaper() || {};
                cachedData.localUrl = imageUrl;
                cachedData.date = new Date().toISOString();
                this.cacheWallpaper(cachedData);
            }
        };
        
        img.onerror = () => {
            console.error(`BingWallpaperManager: Failed to load image (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, imageUrl);
            
            if (retryCount < this.maxRetries) {
                // Try another random wallpaper
                console.log(`BingWallpaperManager: Retrying with a different image in ${this.errorRetryDelay/1000} seconds...`);
                setTimeout(() => {
                    this.fetchRandomWallpaper().then(fallbackData => {
                        if (fallbackData && fallbackData.url !== imageUrl) {
                            console.log('BingWallpaperManager: Trying fallback wallpaper');
                            this.preloadAndApplyImage(fallbackData.url, retryCount + 1);
                        } else {
                            console.error('BingWallpaperManager: Failed to get a valid fallback image');
                            this.restoreDefaultBackgrounds();
                        }
                    }).catch(() => {
                        console.error('BingWallpaperManager: Error fetching fallback wallpaper');
                        this.restoreDefaultBackgrounds();
                    });
                }, this.errorRetryDelay);
            } else {
                console.error('BingWallpaperManager: Maximum retry attempts reached, restoring default backgrounds');
                this.restoreDefaultBackgrounds();
            }
        };
        
        // Start loading the image
        img.src = imageUrl;
    }
    
    /**
     * Apply wallpaper with fadeIn effect
     * @param {string} imageUrl - URL of the wallpaper
     */
    applyWithFadeIn(imageUrl) {
        const night = window.TL.matchNightModel();
        const bgWrapImg = $('#background_wrap_img');
        
        if (bgWrapImg.length > 0) {
            // Fade out current background
            bgWrapImg.fadeOut(100, () => {
                // Set new background
                bgWrapImg.css('background', `url("${imageUrl}") no-repeat center`);
                bgWrapImg.css('background-size', 'cover');
                
                // Fade in new background
                bgWrapImg.fadeIn(100);
                console.log('BingWallpaperManager: Applied wallpaper with fadeIn effect');
            });
        } else {
            // Fallback to original method if elements not found
            console.log('BingWallpaperManager: Background elements not found, using fallback method');
            window.TL.bgLoadImg1(night);
        }
    }
    
    /**
     * Remove Bing wallpaper from backgrounds (restore original)
     */
    removeWallpaper() {
        if (window.TL && window.TL.system_background && this.originalBackgrounds) {
            console.log('BingWallpaperManager: Restoring original backgrounds');
            window.TL.system_background.light = [...this.originalBackgrounds.light];
            window.TL.system_background.dark = [...this.originalBackgrounds.dark];
            console.log('BingWallpaperManager: Restored original backgrounds');
            
            // Clear the cached wallpaper
            localStorage.removeItem(this.cacheKey);
            localStorage.removeItem(this.lastUpdateKey);
            
            // Reload background if already loaded
            if (window.TL.bgLoaded) {
                const night = window.TL.matchNightModel();
                window.TL.bgLoadImg1(night);
            }
        }
    }
    
    /**
     * Check if Bing wallpaper is currently active
     * @returns {boolean}
     */
    isActive() {
        if (!window.TL || !window.TL.system_background) return false;
        
        // Check if user has custom wallpaper
        if (window.TL.mybg_light !== 0 || window.TL.mybg_dark !== 0) {
            return false;
        }
        
        // Check if current background is from Bing (not original SVG)
        const currentLight = window.TL.system_background.light[0];
        const currentDark = window.TL.system_background.dark[0];
        
        return currentLight && currentLight.includes('api.bimg.cc') && 
               currentDark && currentDark.includes('api.bimg.cc');
    }

    /**
     * Fetch and update wallpaper
     */
    async fetchAndUpdateWallpaper() {
        // Double check for mobile device
        if (this.isMobileDevice()) {
            return;
        }
        
        try {
            const wallpaperData = await this.fetchBingWallpaper();
            if (!wallpaperData) {
                console.error('Failed to fetch wallpaper data');
                return;
            }
            
            // Use the image URL directly (no need to download)
            wallpaperData.localUrl = wallpaperData.url;
            
            // Cache the wallpaper data
            this.cacheWallpaper(wallpaperData);
            
            // Apply the wallpaper
            this.applyWallpaper(wallpaperData.localUrl);
            
            console.log('Bing wallpaper updated successfully:', wallpaperData.title);
        } catch (error) {
            console.error('Error updating Bing wallpaper:', error);
        }
    }

    /**
     * Force update wallpaper (for testing)
     */
    forceUpdate() {
        if (this.isMobileDevice()) {
            console.log('Bing wallpaper is disabled on mobile devices');
            return;
        }
        localStorage.removeItem(this.lastUpdateKey);
        this.fetchAndUpdateWallpaper();
    }
    
    /**
     * Get current wallpaper info
     * @returns {object|null}
     */
    getCurrentWallpaperInfo() {
        return this.getCachedWallpaper();
    }
    
    /**
     * Check if using Bing wallpaper
     * @returns {boolean}
     */
    isUsingBingWallpaper() {
        const cached = this.getCachedWallpaper();
        if (!cached) return false;
        
        // Check if the cached wallpaper is being used
        if (window.TL && window.TL.system_background) {
            return window.TL.system_background.light.includes(cached.localUrl) ||
                   window.TL.system_background.dark.includes(cached.localUrl);
        }
        return false;
    }
}

// Create global instance
window.bingWallpaperManager = new BingWallpaperManager();

// Add test functions to window for debugging
window.testBingWallpaper = function() {
    console.log('=== Testing Bing wallpaper ===');
    console.log('Is mobile device:', window.bingWallpaperManager.isMobileDevice());
    console.log('Should update:', window.bingWallpaperManager.shouldUpdate());
    console.log('Cached wallpaper:', window.bingWallpaperManager.getCachedWallpaper());
    console.log('Is Bing wallpaper active:', window.bingWallpaperManager.isActive());
    
    if (window.TL) {
        console.log('TL available');
        console.log('Custom backgrounds - Light:', window.TL.mybg_light, 'Dark:', window.TL.mybg_dark);
        console.log('System backgrounds:', window.TL.system_background);
        console.log('Background loaded:', window.TL.bgLoaded);
        console.log('Original backgrounds stored:', !!window.bingWallpaperManager.originalBackgrounds);
    } else {
        console.log('TL not available');
    }
    
    // Force init for testing
    window.bingWallpaperManager.init();
};

window.removeBingWallpaper = function() {
    console.log('Removing Bing wallpaper...');
    window.bingWallpaperManager.removeWallpaper();
};

window.forceBingWallpaperUpdate = function() {
    console.log('Force updating Bing wallpaper...');
    window.bingWallpaperManager.forceUpdate();
};

window.getBingWallpaperStatus = function() {
    console.log('=== Bing Wallpaper Status ===');
    console.log('Active:', window.bingWallpaperManager.isActive());
    console.log('Cached data:', window.bingWallpaperManager.getCachedWallpaper());
    console.log('Last update:', localStorage.getItem(window.bingWallpaperManager.lastUpdateKey));
    if (window.TL && window.TL.system_background) {
        console.log('Current backgrounds:', window.TL.system_background);
    }
};

window.simulateBackgroundLoad = function() {
    console.log('=== Simulating Background Load Process ===');
    if (window.TL) {
        console.log('1. Calling TL.checkAndLoadBingWallpaper()...');
        window.TL.checkAndLoadBingWallpaper();
    } else {
        console.log('TL not available');
    }
};

window.testFadeInEffect = function() {
    console.log('=== Testing FadeIn Effect ===');
    const cachedData = window.bingWallpaperManager.getCachedWallpaper();
    if (cachedData && cachedData.localUrl) {
        console.log('Testing fadeIn with cached wallpaper:', cachedData.localUrl);
        window.bingWallpaperManager.applyWithFadeIn(cachedData.localUrl);
    } else {
        console.log('No cached wallpaper available for testing');
        // Force fetch a new one for testing
        window.bingWallpaperManager.forceUpdate();
    }
};