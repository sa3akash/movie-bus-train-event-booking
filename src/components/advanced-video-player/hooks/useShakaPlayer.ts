import { useCallback } from "react";
import { AdvancedVideoPlayerProps } from "../types";

declare var google: any;

export function useShakaPlayer({
  videoRef,
  containerRef,
  playerRef,
  propsRef,
  shaka,
  isSupported,
  adManagerRef,
  registeredAdsRef,
  adMetadataMapRef,
  currentAdRef,
  setIsAdPlaying,
  isAdPlayingRef,
  setAdTitle,
  setCanSkipAd,
  setAdTimeRemaining,
  setAdTimeUntilSkippable,
  setAdCurrentTime,
  setAdDuration,
  setDuration,
  setCurrentTime,
  setVideoTracks,
  setActiveTrackHeight,
  setTextTracks,
  setSelectedTextTrackId,
  setIsTextTrackVisible,
  setAudioLanguages,
  setSelectedAudioLanguage,
  setIsLiveState,
  setSeekRange,
  setChapters,
  setIsBuffering,
  loadVttStoryboard,
}: any) {
  const initializePlayer = useCallback(async (props: AdvancedVideoPlayerProps) => {
    propsRef.current = props;
    const { 
      manifestUrl, storyboardUrl, ads, shakaConfig, drm, onPlayerReady,
      buffering, retryParameters, lowLatencyMode, licenseRequestFilter, licenseResponseFilter 
    } = props;
    
    if (!shaka || !isSupported || !videoRef.current || !containerRef.current) return;

    if (playerRef.current) {
      await playerRef.current.destroy();
    }

    const player = new shaka.Player(videoRef.current);
    playerRef.current = player;
    
    if (shakaConfig) player.configure(shakaConfig);
    if (drm) player.configure({ drm });
    if (buffering) player.configure({ streaming: buffering });

    if (retryParameters) {
      const retryConfig: any = {};
      if (retryParameters.manifest) retryConfig.manifest = { retryParameters: retryParameters.manifest };
      if (retryParameters.streaming) retryConfig.streaming = { retryParameters: retryParameters.streaming };
      if (retryParameters.drm) retryConfig.drm = { retryParameters: retryParameters.drm };
      player.configure(retryConfig);
    }

    if (lowLatencyMode) {
      if (typeof player.configurationForLowLatency === 'function') {
        player.configure(player.configurationForLowLatency());
      } else {
        player.configure({
          streaming: {
            lowLatencyMode: true,
            inaccurateManifestTolerance: 0,
            segmentPrefetchLimit: 2,
            updateIntervalSeconds: 0.1,
            maxDisabledTime: 1,
            retryParameters: { baseDelay: 100 },
          },
          manifest: {
            dash: { autoCorrectDrift: false },
            retryParameters: { baseDelay: 100 },
          },
          drm: {
            retryParameters: { baseDelay: 100 },
          },
        });
      }
    }

    if (licenseRequestFilter) player.getNetworkingEngine().registerRequestFilter(licenseRequestFilter);
    if (licenseResponseFilter) player.getNetworkingEngine().registerResponseFilter(licenseResponseFilter);
    
    player.configure('ads.supportsMultipleMediaElements', true);

    player.addEventListener('buffering', (event: any) => {
      setIsBuffering(event.buffering);
    });

    const syncActiveTrack = () => {
      const activeTrack = player.getVariantTracks().find((t: any) => t.active);
      if (activeTrack) setActiveTrackHeight(activeTrack.height);
    };
    player.addEventListener('adaptation', syncActiveTrack);
    player.addEventListener('variantchanged', syncActiveTrack);

    // Custom Interstitials AdManager Setup
    const adManager = player.getAdManager();
    adManagerRef.current = adManager;
    
    let adContainer = containerRef.current.querySelector('.shaka-custom-ad-container') as HTMLDivElement;
    if (!adContainer) {
      adContainer = document.createElement('div');
      adContainer.className = 'shaka-custom-ad-container';
      adContainer.style.position = 'absolute';
      adContainer.style.top = '0';
      adContainer.style.left = '0';
      adContainer.style.width = '100%';
      adContainer.style.height = '100%';
      adContainer.style.pointerEvents = 'none';
      containerRef.current.appendChild(adContainer);
    }

    adManager.setContainers(adContainer, adContainer);
    
    try {
      adManager.initClientSide(adContainer, videoRef.current);
    } catch (e) {
      console.warn("initClientSide failed", e);
    }
    
    try {
      let adVideo = adContainer.querySelector('video') as HTMLVideoElement;
      if (!adVideo) {
        adVideo = document.createElement('video');
        adVideo.style.width = '100%';
        adVideo.style.height = '100%';
        adVideo.playsInline = true;
        adVideo.autoplay = true;
        adContainer.appendChild(adVideo);
      }
      
      if (typeof adManager.initInterstitial === "function") {
        adManager.initInterstitial(adContainer, videoRef.current, adVideo);
      }
    } catch (e) {
      console.warn("initInterstitial failed", e);
    }

    adManager.addEventListener('ad-started', (e: any) => {
      const ad = e.ad;
      currentAdRef.current = ad;
      setIsAdPlaying(true);
      isAdPlayingRef.current = true;
      
      if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
      }
      
      let title = "Advertisement";
      let metadata: any = null;
      if (typeof ad.getTitle === 'function' && ad.getTitle()) {
        title = ad.getTitle();
      } else {
        const id1 = typeof ad.getAdId === 'function' ? ad.getAdId() : null;
        if (id1 && adMetadataMapRef.current.has(id1)) {
          metadata = adMetadataMapRef.current.get(id1);
        }
        if (!metadata) {
          for (const key in ad) {
            const val = ad[key];
            if (val && typeof val === 'object' && val.id && adMetadataMapRef.current.has(val.id)) {
              metadata = adMetadataMapRef.current.get(val.id);
              break;
            }
          }
        }
        if (!metadata && adMetadataMapRef.current.size === 1) {
          metadata = Array.from(adMetadataMapRef.current.values())[0];
        }
        if (metadata?.title) {
          title = metadata.title;
        }
      }
      
      setAdTitle(title);
      propsRef.current?.onAdStart?.({ id: ad.id, title, ...metadata });
      
      setCanSkipAd(ad.canSkipNow ? ad.canSkipNow() : false);
      adContainer.style.pointerEvents = 'auto';
    });

    adManager.addEventListener('ad-stopped', () => {
      currentAdRef.current = null;
      setIsAdPlaying(false);
      isAdPlayingRef.current = false;
      setCanSkipAd(false);
      setAdTimeRemaining(0);
      setAdTimeUntilSkippable(0);
      setAdCurrentTime(0);
      setAdDuration(0);
      adContainer.style.pointerEvents = 'none';
      
      if (videoRef.current) {
        setDuration(videoRef.current.duration || 0);
        setCurrentTime(videoRef.current.currentTime || 0);
      }
      propsRef.current?.onAdEnd?.();
    });

    adManager.addEventListener('ad-skip-state-changed', (e: any) => {
      setCanSkipAd(e.ad.canSkipNow ? e.ad.canSkipNow() : true);
    });

    let finalManifestUrl = manifestUrl;

    try {
      if (ads?.mediaTailor) {
        if (ads.mediaTailor.type === 'client') {
          finalManifestUrl = await adManager.requestMediaTailorStream(ads.mediaTailor.url, ads.mediaTailor.adsParams);
        } else {
          finalManifestUrl = await adManager.requestMediaTailorStream(ads.mediaTailor.url);
        }
      } else if (ads?.imaServerSide && typeof google !== 'undefined' && google.ima && google.ima.dai) {
        if (ads.imaServerSide.assetKey) {
          const streamRequest = new google.ima.dai.api.LiveStreamRequest();
          streamRequest.assetKey = ads.imaServerSide.assetKey;
          finalManifestUrl = await adManager.requestServerSideStream(streamRequest);
        } else if (ads.imaServerSide.contentSourceId && ads.imaServerSide.videoId) {
          const streamRequest = new google.ima.dai.api.VODStreamRequest();
          streamRequest.contentSourceId = ads.imaServerSide.contentSourceId;
          streamRequest.videoId = ads.imaServerSide.videoId;
          finalManifestUrl = await adManager.requestServerSideStream(streamRequest);
        }
      } else if (ads?.adTagUrl && typeof google !== 'undefined' && google.ima) {
        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = ads.adTagUrl;
        adManager.requestClientSideAds(adsRequest);
      } else if (ads?.requestUrl || ads?.customAds) {
        let customAdsData = ads.customAds || [];
        
        if (ads.requestUrl && customAdsData.length === 0) {
          const res = await fetch(ads.requestUrl);
          const data = await res.json();
          if (data.success && data.ads) customAdsData = data.ads;
        }
        
        customAdsData.forEach((ad: any) => {
          if (registeredAdsRef.current.has(ad.id)) return;
          
          adMetadataMapRef.current.set(ad.id, {
            isSkippable: ad.isSkippable ?? true,
            skipOffset: ad.skipOffset ?? 5,
            title: ad.title
          });

          const safeTracking: Record<string, string[]> = {};
          if (ad.tracking) {
            for (const [event, urls] of Object.entries(ad.tracking)) {
              safeTracking[event] = (urls as string[]).map((url: string) => 
                url.startsWith('/') ? `${window.location.origin}${url}` : url
              );
            }
          }

          adManager.addCustomInterstitial({
            id: ad.id,
            groupId: ad.groupId || null,
            startTime: ad.startTime === 0 ? null : ad.startTime,
            endTime: ad.endTime ?? null,
            uri: ad.uri,
            mimeType: ad.mimeType || null,
            isSkippable: ad.isSkippable ?? true,
            skipOffset: ad.skipOffset ?? 5,
            skipFor: ad.skipFor || null,
            canJump: false,
            resumeOffset: ad.category === "PRE_ROLL" ? 0 : (ad.resumeOffset ?? null),
            playoutLimit: ad.playoutLimit ?? null,
            once: true,
            pre: ad.category === "PRE_ROLL",
            post: ad.category === "POST_ROLL",
            timelineRange: false,
            loop: false,
            overlay: null,
            displayOnBackground: false,
            currentVideo: null,
            background: null,
            clickThroughUrl: ad.clickThroughUrl || null,
            tracking: Object.keys(safeTracking).length > 0 ? safeTracking : null,
          });

          registeredAdsRef.current.add(ad.id);
        });
      }
    } catch (e) {
      console.warn("Failed to setup ads in custom player", e);
    }

    try {
      await player.load(finalManifestUrl);
      
      const tracks = player.getVariantTracks();
      setVideoTracks(tracks);
      
      const activeTrack = tracks.find((t: any) => t.active);
      if (activeTrack) setActiveTrackHeight(activeTrack.height);

      const allTextTracks = player.getTextTracks();
      setTextTracks(allTextTracks);
      const activeTextTrack = allTextTracks.find((t: any) => t.active);
      if (activeTextTrack) setSelectedTextTrackId(activeTextTrack.id.toString());
      setIsTextTrackVisible(player.isTextTrackVisible());

      const uniqueAudioLangs = Array.from(new Set(tracks.map((t: any) => t.language).filter(Boolean)));
      setAudioLanguages(uniqueAudioLangs.map(lang => ({ language: lang })));
      if (activeTrack && activeTrack.language) {
         setSelectedAudioLanguage(activeTrack.language);
      }

      setIsLiveState(props.isLive || player.isLive());
      if (player.isLive()) {
        const range = player.seekRange();
        setSeekRange({ start: range.start, end: range.end });
      }

      try {
        const parsedChapters = await player.getChaptersAsync();
        if (parsedChapters && parsedChapters.length > 0) {
          setChapters(parsedChapters);
        } else if (props.chapters) {
          setChapters(props.chapters);
        }
      } catch (e) {
        if (props.chapters) setChapters(props.chapters);
      }

      player.addEventListener('trackschanged', () => {
         const updatedTextTracks = player.getTextTracks();
         setTextTracks(updatedTextTracks);
         
         const updatedVariantTracks = player.getVariantTracks();
         const updatedAudioLangs = Array.from(new Set(updatedVariantTracks.map((t: any) => t.language).filter(Boolean)));
         setAudioLanguages(updatedAudioLangs.map(lang => ({ language: lang })));
      });

      if (onPlayerReady) {
        onPlayerReady(player);
      }
    } catch (err: any) {
      if (err.code === 7000) {
        console.warn("Load interrupted (likely due to fast re-mounting).");
      } else {
        console.error("Error loading manifest:", err.code, err.message, err);
        propsRef.current?.onError?.(err);
      }
    }

  }, [
    shaka, isSupported, videoRef, containerRef, playerRef, propsRef, 
    adManagerRef, registeredAdsRef, adMetadataMapRef, currentAdRef,
    setIsAdPlaying, isAdPlayingRef, setAdTitle, setCanSkipAd, setAdTimeRemaining, 
    setAdTimeUntilSkippable, setAdCurrentTime, setAdDuration, setDuration, 
    setCurrentTime, setVideoTracks, setActiveTrackHeight, setTextTracks, 
    setSelectedTextTrackId, setIsTextTrackVisible, setAudioLanguages, 
    setSelectedAudioLanguage, setIsLiveState, setSeekRange, setChapters, 
    setIsBuffering, loadVttStoryboard
  ]);

  return {
    initializePlayer,
  };
}
