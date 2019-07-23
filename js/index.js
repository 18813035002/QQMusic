$(function () {

    var $audio = $("audio");
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var lyric;

    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url: "./source/musiclist.json",
            // dataType: "json",
            success: function (data) {
                player.musicList = data;
                var $musicList = $(".content_list>ul");
                $.each($.parseJSON(data), function (index, ele) {
                    var $item = crateMusicItem(index, ele);
                    $musicList.append($item);
                })

                initMusicInfo($.parseJSON(data)[0]);
                initMusicLyric($.parseJSON(data)[0]);
            },
            error: function (e) {
                console.log(e);
            }
        })
    } 

    //初始化进度条
    initProgress();
    function initProgress(){
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");
        progress = Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function(value){
            player.musicSeekTo(value);
        });
    
        progress.progressMove(function(value){
            player.musicSeekTo(value);
        });
    
        //
        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        voiceProgress = Progress($voiceBar, $voiceLine, $voiceDot);
        voiceProgress.progressClick(function(value){
            player.musicVoiceSeekTo(value);
        });
    
        voiceProgress.progressMove(function(value){
            player.musicVoiceSeekTo(value);
        });
    }

    //初始化歌曲信息
    function initMusicInfo(music) {
        var $musicImage = $(".song_info_pic>img");
        var $musicName = $(".song_info_name>a");
        var $musicSinger = $(".song_info_singer>a");
        var $musicAlbum = $(".song_info_album>a");
        var $musicProgressName = $(".music_progress_name");
        var $musicProgressTime = $(".music_progress_time");
        var $musicBg = $(".mask_bg");

        $musicImage.attr("src", music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name + " / " + music.singer);
        $musicProgressTime.text("00:00 / " + music.time);
        $musicBg.css("background", "url('" + music.cover + "') no-repeat 0 0");
    }

    //初始化歌词信息
    function initMusicLyric(music) {
        lyric= new Lyric(music.link_lrc);
        var $lyricContainer = $(".song_lyric");

        //清空上一首音乐的歌词
        $lyricContainer.html("");
        lyric.loadLyric(function(){
            //创建歌词列表
            $.each(lyric.lyrics, function(index,ele){
                var $item = $("<li>"+ele+"</li>");
                $lyricContainer.append($item);
            });
        });
    }

    // $(".content_list").mCustomScrollbar();
    initEvents();
    function initEvents() {
        $(".content_list").delegate(".list_music", "mouseenter", function () {
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_time>a").stop().fadeIn(100);
            $(this).find("span").stop().fadeOut(100);
        })

        $(".content_list").delegate(".list_music", "mouseleave", function () {
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_time>a").stop().fadeOut(100);
            $(this).find("span").stop().fadeIn(100);
        })

        $(".content_list").delegate(".list_check", "click", function () {
            if ($(this).attr("class").indexOf("list_checked") == -1) {
                $(this).addClass("list_checked");
            } else {
                $(this).removeClass("list_checked");
            }
        })

        //添加子菜单播放按钮监听
        var $musicPlay = $(".music_play");
        var $musicVoice = $(".music_voice");
        $(".content_list").delegate(".list_menu>.list_menu_play", "click", function () {
            $(this).parents(".list_music").get(0);
            $(this).toggleClass("list_menu_play2");
            $(this).parents(".list_music").siblings().find(".list_menu_play").removeClass("list_menu_play2");
            // console.log($(this).attr("class").indexOf("list_menu_play2"));
            if ($(this).attr("class").indexOf("list_menu_play2") != -1) {
                $musicPlay.addClass("music_play2");
                $(this).parents(".list_music").find("div").css("color", "#fff");
                $(this).parents(".list_music").siblings().find("div").css("color", "rgba(255,255,255,0.5)");
                $(this).parents(".list_music").find(".list_number").addClass("list_number2");
                $(this).parents(".list_music").siblings().find(".list_number").removeClass("list_number2");
            } else {
                $musicPlay.removeClass("music_play2");
                $(this).parents(".list_music").find("div").css("color", "rgba(255,255,255,0.5)");
                $(this).parents(".list_music").find(".list_number").removeClass("list_number2");
            }

            //播放音乐
            player.playMusic($(this).parents(".list_music").get(0).index, $(this).parents(".list_music").get(0).music);
            //切换歌曲信息
            initMusicInfo($(this).parents(".list_music").get(0).music);
            //切换歌词信息
            initMusicLyric()

        })

        $musicPlay.click(function () {
            if (player.currentIndex == -1) {
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");

            } else {
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        })

        $(".music_pre").click(function () {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        })

        $(".music_next").click(function () {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        })

        $(".content_list").delegate(".list_menu_delete", "click", function () {
            var $item = $(this).parents(".list_music");
            $item.remove();
            player.changeMusic($item.get(0).index);

            $(".list_music").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".list_number").text(index + 1);
            })
        })

        //监听播放的速度
        player.musicTimeUpDate(function(currentTime,duration,timeStr){
            //同步时间
            $(".music_progress_time").text(timeStr);
            //同步进度条
            //计算播放比例
            var value = currentTime/duration *100;
            progress.setProgress(value);

            //实现歌词的同步
            var index = lyric.currentIndex(currentTime);
            var $item = $(".song_lyric>li").eq(index);
            $item.addClass("current");
            $item.siblings().removeClass("current");

            if(index <= 2) return;
            $(".song_lyric").css({
                marginTop: (-index+2)*30
            })
        })

        //监听声音按钮的点击
        $musicVoice.click(function(){
            $(this).toggleClass("music_mute");
            if($(this).attr("class").indexOf("music_mute") != -1){
                //变为没有声音
                player.musicVoiceSeekTo(0);
            }else{
                //变为有声音
                player.musicVoiceSeekTo(1);
            }
        })

        $(".footer_in>.music_mode").click(function(){
            $(".music_mode").toggleClass("music_mode2");
            $(".footer_in>.music_mode").click(function(){
                $(".music_mode").toggleClass("music_mode3");
                $(".footer_in>.music_mode").click(function(){
                    $(".music_mode").toggleClass("music_mode4");
                })
            })
        })

        $(".footer_in>.music_fav").click(function(){
            $(".music_fav").toggleClass("music_fav2");
        })

        $(".footer_in>.music_only").click(function(){
            $(".music_only").toggleClass("music_only2");
        })
    }

    
    

    function crateMusicItem(index, music) {
        var $item = $("<li class=\"list_music\">\n" +
            "<div class=\"list_check\"><input type=\"checkbox\"></div>\n" +
            "<div class=\"list_number\">" + (index + 1) + "</div>\n" +
            "<div class=\"list_name\">" + music.name + "" +
            "<div class=\"list_menu\">\n" +
            "<a href=\"javascript:;\" title=\"播放\" class=\"list_menu_play\"></a>\n" +
            "<a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "<a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "<a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "</div>\n" +
            "</div>\n" +
            "<div class=\"list_singer\">" + music.singer + "</div>\n" +
            "<div class=\"list_time\">\n" +
            "<span>" + music.time + "</span>\n" +
            "<a href=\"javascript:;\" title=\"删除\" class=\"list_menu_delete\"></a>\n" +
            "</div>\n" +
            "</li>");

        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }
})