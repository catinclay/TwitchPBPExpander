console.log("Injected Twitch PBP Expander.");

var isUnmutingPBPVideo = false;
var originalVideoIsMuted = false;

function GetOriginalVideo() {
    const originalContainer = document.querySelector('.video-player__container');
    return originalContainer.querySelector('video');
}

function GetOriginalPlayer() {
    return window.document.body.getElementsByClassName("persistent-player")[0];
}

function GetSideChat() {
    return window.document.body.getElementsByClassName("channel-root__right-column")[0];
}

function ShrinkSideChat() {
    // Shrink the side chat.
    var sideChat = GetSideChat();
    sideChat.style.transform = "translateX(-34rem) translateZ(0px)";
    sideChat.style.width = "34rem";

    // Restores the orginal player size.
    GetOriginalPlayer().style.maxWidth = "calc(100% - 34rem)";

}

function ExpandSideChat() {
    // Expand the side chat.
    var sideChat = GetSideChat();
    sideChat.style.transform = "translateX(-80rem) translateZ(0px)";
    sideChat.style.width = "80rem";

    // Remove the restriction of the pbpPlayer height.
    const pbpPlayer = window.document.body.getElementsByClassName("picture-by-picture-player")[0];
    pbpPlayer.style.maxHeight = 'none';

    // Shink original player.
    GetOriginalPlayer().style.maxWidth = "calc(100% - 80rem)";
}


function ConfigureSoundStatusWhenAdsStart() {
    // Cache muted status for original video.
    // We don't unmute the pbp video here since we want to leverage MaintainPBPVideoSound().
    const originalVideo = GetOriginalVideo();
    originalVideoIsMuted = originalVideo.muted;
    const pbpVideoContainer = document.querySelector('.pbyp-player-instance');
    const pbpVideo = pbpVideoContainer.querySelector('video');
    originalVideo.muted = true;
}

function MaintainPBPVideoSound() {
    if (!originalVideoIsMuted) {
        const pbpVideoContainer = document.querySelector('.pbyp-player-instance');
        const pbpVideo = pbpVideoContainer.querySelector('video');
        // aligns volume with original video.
        pbpVideo.volume = GetOriginalVideo().volume;
        if (pbpVideo.muted) {
            pbpVideo.muted = false;    
        }
    }
}

function ConfigureSoundStatusWhenAdsEnd() {
    // Unmutes the originalVideo if it's not muted before ads.
    if (!originalVideoIsMuted) {
        GetOriginalVideo().muted = false;
    }
}

function ExistAdsLabel() {
    return window.document.body.getElementsByClassName(
        "tw-absolute tw-c-background-overlay tw-c-text-overlay tw-inline-block tw-left-0 tw-pd-1 tw-top-0").length != 0;
}

function ConfigureVideosAndModifyUI() {
    const pbpVideoContainer = document.querySelector('.pbyp-player-instance');
    if (pbpVideoContainer == undefined || !ExistAdsLabel()) {
        // PBP Player does not exist or the ads label is not shown. Consider no ads is playing.
        if (isUnmutingPBPVideo) {
            isUnmutingPBPVideo = false;
            ConfigureSoundStatusWhenAdsEnd();
        }
        // If watching mode changed during PBP expanding, side chat size will be broken so we have to 
        // continuously maintain the size of the chat bar.
        ShrinkSideChat();
    } else {
        // PBP Player does exist. It's now playing ads.
        if (!isUnmutingPBPVideo) {
            isUnmutingPBPVideo = true;
            ConfigureSoundStatusWhenAdsStart();
        }
        // Keep maintaining the size of the chat bar.
        ExpandSideChat();
        // PBP video sometimes got muted while ads is playing, so we workaround by keeping maintaining the muted status for it.
        MaintainPBPVideoSound();
    }
}

setInterval(function(){
    ConfigureVideosAndModifyUI();
}, 500);