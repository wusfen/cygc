ajax.base = location.origin + '/labelling_platform/'
if (location.protocol == 'file:') {
    ajax.base = 'http://10.4.91.91:8080/labelling_platform/'
    ajax.base = 'http://10.4.91.126:8080/labelling_platform/'
    // ajax.base = 'http://10.4.91.2:8088/labelling_platform/'
}

var vue = new Vue({
    el: '#vue',
    data: {
        table: {
            area: [],
            count: [],
            subArea: [],
            subCount: [],
            historyCount: [],
            forecast3: {
                count: [],
                tip: [],
            },
            forecast5: {
                count: [],
                tip: [],
            },
            forecast10: {
                count: [],
                tip: [],
            },
            person: [],
            track: [],
            trackTest: [],
            personTest: [],
        },
        selected: {
            person: {},
            track: {},
            area: {},
            personTest: {}
        },
        hover: {
            track: {},
        },
        vx: true, // 翻转
        vv: false, // 直播弹窗
        subAreaPosition: {},
        total: 0,
        loading: false,
        currentVideoIp: '',
    },
    methods: {
        hh: function(argument) {
            alert()
        },
        videoFullscreen: function() {
            if (video.webkitExitFullscreen) {
                video.webkitDisplayingFullscreen ?
                    video.webkitExitFullscreen() :
                    video.webkitEnterFullscreen()
            }
        },
        rem: function(x) {
            return x / 100 + 'rem'
        },
        areaLoad: function() {
            ajax({
                local: 'data/area.json',
                url: 'trajectory/listArea.do',
                success: function(res) {
                    var data = res.data || []
                    vue.table.area = data
                }
            })
        },
        subAreaLoad: function(area) {
            ajax({
                local: 'data/subArea.json',
                url: 'trajectory/listArea.do',
                data: {
                    area_id: area.id
                },
                success: function(res) {
                    var data = res.data || []
                    vue.table.subArea = data
                }
            })
        },
        areaPercent: function(item) {
            return item.width / vue.table.area.sum('width') * 100 + '%'
        },
        countLoad: function() {
            ajax({
                local: 'data/count.json',
                url: 'trajectory/countArea.do',
                success: function(res) {
                    var data = res.data || []
                    vue.table.count = data
                }
            })
        },
        subCountLoad: function(area) {
            ajax({
                local: 'data/count.json',
                url: 'trajectory/countArea.do',
                data: {
                    area_id: area.id
                },
                success: function(res) {
                    var data = res.data || []
                    vue.table.subCount = data
                }
            })
        },
        historyCountLoad: function(area) {
            ajax({
                local: 'data/chart.line.json',
                url: 'trajectory/chart.do',
                data: {
                    area_id: area.id
                },
                success: function(res) {
                    var data = res.data || []
                    vue.table.historyCount = data
                }
            })
        },
        forecastLoad: function(m) {
            $.ajax({
                local: 'data/forecast.json',
                url: ajax.base + '/forecastJson/getFutureMinutesAreaCount.do',
                data: {
                    minutes: m
                },
                type: 'post',
                dataType: 'json',
                success: function(res) {
                    var data = res.data || {
                        count: [],
                        tip: [],
                    }
                    vue.table['forecast' + m] = data
                }
            })
        },
        personLoad: function() {
            ajax({
                local: 'data/person.json',
                url: 'trajectory/listTargetInfo.do',
                success: function(res) {
                    var data = res.data || []
                    vue.table.person = data
                }
            })
        },
        personTestLoad: function() {
            ajax({
                local: 'data/personTest.json',
                url: 'trajectory/listTargetInfo.do xxxxxxxxxxx  todo',
                success: function(res) {
                    var data = res.data || []
                    vue.table.personTest = data
                }
            })
        },
        currentVideoIpSearch: function () {
            ajax({
                url: 'trajectory/getCurrentVideoIp.do',
                local: 'getCurrentVideoIp.json',
                success: function (res) {
                    var data = res.data || ''
                    vue.currentVideoIp = data
                }
            })
        },
        trackLoad: function(isFirst) {
            ajax({
                local: 'data/listPersonTrajectory.json',
                // local: 'data/track.json',
                // local: 'data/t.json',
                url: 'trajectory/listPersonTrajectory.do',
                data: {
                    identity_id: vue.selected.person.no
                },
                success: function(res) {
                    var data = res.data || []
                    vue.table.track = data

                    // draw
                    vue.trackDraw(isFirst)
                }
            })
        },
        trackTestLoad: function() {
            ajax({
                local: 'data/listMacTrace.json',
                success: function(res) {
                    var data = res.data || []
                    vue.table.trackTest = data
                }
            })
        },
        trackTestDraw: function() {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height) // clear

            var list = vue.table.trackTest
            var colorList = ['#0af', '#fa0', '#0f0', '#0ff', '#ff0', '#fff', '#000', '#f00', '#f0a']
            var group = list.groupBy('mac')
            var macList = Object.keys(group)

            for (var i = 0; i < macList.length; i++) {
                var mac = macList[i]
                var line = group[mac]
                vue.drawLine(line, colorList[i])
            }

        },
        drawLine: function(list, color) {
            context.strokeStyle = color
            context.lineWidth = 2

            for (var i = 0; i < list.length; i++) {
                var pre = list[i - 1]
                var item = list[i]
                // line
                if (pre) {
                    context.beginPath()
                    context.moveTo(pre.x, pre.y)
                    context.lineTo(item.x, item.y)
                    context.stroke()
                    context.closePath()
                }
                // dot
                context.fillStyle = item==list.last()?'#fff':color;
                context.beginPath();
                context.arc(item.x, item.y, 4, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();
            }
        },
        drawDot: function(item) {

        },
        trackDraw: function(isFirst) {
            isFirst = false // !!! 去掉延时 ** 中间断？？
            clearTimeout(vue._t1)
            clearTimeout(vue._t2)
            clearTimeout(vue._t3)
            // context.moveTo(item.x, item.y)
            var list = vue.table.track

            context.clearRect(0, 0, context.canvas.width, context.canvas.height) // clear
            // context.strokeStyle = 'rgba(0,200,255, 1)'
            context.strokeStyle = 'rgba(255,255,255, 1)'
            context.lineWidth = 2

            var group = list.groupBy('mac')
            var i = 0
            for (var key in group) {
                var arr = group[key]
                vue['_t' + i] = drawL(arr)
                i++
            }

            function drawL(list) { // return timer
                var timer;
                if (isFirst) {
                    for (var i = 0; i < list.length - 100; i++) {
                        drawI(i)
                    }! function loop(i) {
                        timer = setTimeout(function() {
                            drawI(i)
                            i < list.length - 1 && loop(i + 1)
                        }, 1)
                    }(100 > list.length ? 0 : 100)
                } else {
                    for (var i = 0; i < list.length; i++) {
                        drawI(i)
                    }
                }

                function drawI(i) {
                    var item = list[i]
                    var next = list[i + 1]
                    if (item && next) {
                        context.beginPath()
                        context.moveTo(item.x, item.y)
                        context.lineTo(next.x, next.y)
                        context.stroke()
                        context.closePath()
                    }
                }
                return timer
            }
        },
        play: function(src) {
            vue.flashPlay(src)
            vue.$refs.video.src = src
        },
        flashPlay: function(src) {
            var flashvars = {
                // src: "http://10.4.91.126:8080/1.flv",
                // src: "http://10.4.91.126:8080/a123.mp4",
                // src: "ftp://uftp:uftp@10.4.91.233/mp/123.mp4",
                src: src
            };
            var params = {
                allowFullScreen: true,
                allowScriptAccess: "always",
                bgcolor: "#000000"
            };
            var attrs = {
                name: "player"
            };

            swfobject.embedSWF("lib/GrindPlayer.swf", "player", "600", "300", "10.2", null, flashvars, params, attrs);
        }
    },
    mounted: function() {
        vue = this

        // vue.areaLoad()
        // vue.countLoad()
        // vue.forecastLoad(3)
        // vue.forecastLoad(5)
        // vue.forecastLoad(10)

        // vue.personLoad()
    }
})

// 

var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')
var video = document.getElementById('video')
if (video) {
    video.onloadstart = function() {
        vue.loading = true
    }
    video.onwaiting = function() {
        vue.loading = true
    }
    video.oncanplay = function() {
        vue.loading = false
    }
}