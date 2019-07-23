(function (window) {

    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    }

    Progress.prototype = {
        constructor: Progress,
        init: function ($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove: false,
        progressClick: function (callBack) {
            var $this = this;
            this.$progressBar.click(function (event) {
                var normalLeft = $(this).offset().left;
                var eventLeft = event.pageX;
                $this.$progressLine.css("width", eventLeft - normalLeft);

                //计算进度条比例
                var value = (eventLeft - normalLeft) / $(this).width();
                callBack(value);
            })
        },

        progressMove: function (callBack) {
            var $this = this;
            var normalLeft = this.$progressBar.offset().left;
            var eventLeft;
            this.$progressBar.mousedown(function () {
                $this.isMove = true;
                $(document).mousemove(function () {
                    eventLeft = event.pageX;
                    $this.$progressLine.css("width", eventLeft - normalLeft);
                })
            })

            $(document).mouseup(function () {
                $(document).off("mousemove");
                //计算进度条比例
                var value = (eventLeft - normalLeft) / $this.$progressBar.width();
                callBack(value);
                $this.isMove = false;
            })

        },

        setProgress: function (value) {
            if (this.isMove) return;
            if (value < 0 || value > 100) return;
            this.$progressLine.css({
                width: value + "%"
            })
        }

    }

    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);