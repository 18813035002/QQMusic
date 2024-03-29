(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    }

    Player.prototype = {
        constructor: Player,
        musicList: [],
        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        currentIndex: -1,
        playMusic: function (index, music) {
            if (this.currentIndex == index) {
                if (this.audio.paused) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            } else {
                this.$audio.attr("src", music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },

        preIndex: function () {
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = index + 14;
            }
            return index;
        },

        nextIndex: function () {
            var index = this.currentIndex + 1;
            if (index > (this.musicList.length - 2830)) {
                index = 0;
            }
            return index;
        },

        changeMusic: function (index) {
            this.musicList.splice(index, 1);
            if (index < this.currentIndex - 1) {
                this.currentIndex = this.currentIndex - 1;
            }
        },

        musicTimeUpDate: function (callBack) {
            var $this = this;
            this.$audio.on("timeupdate", function () {
                var duration = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(currentTime, duration);
                callBack(currentTime,duration,timeStr);
                // console.log(currentTime);
                // console.log(timeStr);
                // $(".music_progress_time").text(timeStr);
            })
        },

        formatDate: function (currentTime, duration) {
            var endMin = parseInt(duration / 60);
            var endSec = parseInt(duration % 60);
            if (endMin < 10) {
                endMin = "0" + endMin;
            }
            if (endSec < 10) {
                endSec = "0" + endSec;
            }
            var startMin = parseInt(currentTime / 60);
            var startSec = parseInt(currentTime % 60);
            if (startMin < 10) {
                startMin = "0" + startMin;
            }
            if (startSec < 10) {
                startSec = "0" + startSec;
            }
            return startMin + ":" + startSec + " / " + endMin + ":" + endSec;
        },

        musicSeekTo: function(value){
            if(isNaN(value)) return;
            this.audio.currentTime = this.audio.duration * value;
        },

        musicVoiceSeekTo: function(value){
            if(isNaN(value)) return;
            if(value <0 || value >1) return;
            this.audio.volume = value;
        }
    }

    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);