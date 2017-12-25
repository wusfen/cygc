
    ajax.base = location.origin + '/labelling_platform/'
    if (location.protocol=='file:') {
        ajax.base = 'http://10.4.91.126:8080/labelling_platform/'
        ajax.base = 'http://10.4.91.91:8080/labelling_platform/'
        // ajax.base = 'http://10.4.91.2:8088/labelling_platform/'
    }
    // ajax.useLocal = true

    var vue = new Vue({
        el: '#vue',
        data: {
            table: {
                area: [],
                subArea: [],
                count: [],
                subCount: [],
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
            },
            selected: {
                person: {},
                track: {},
                area: {},
            },
            subAreaPosition: {},
            total: 0,
        },
        methods: {
            videoFullscreen: function () {
                if (video.webkitExitFullscreen) {
                    video.webkitDisplayingFullscreen?
                    video.webkitExitFullscreen():
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
            subAreaLoad: function (area) {
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
            forecastLoad: function(m) {
                $.ajax({
                    local: 'data/forecast.json',
                    url: ajax.base+'/forecastJson/getFutureMinutesAreaCount.do',
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
            trackLoad: function() {
                ajax({
                    local: 'data/track.json',
                    url: 'trajectory/listPersonTrajectory.do',
                    data: {
                        identity_id: vue.selected.person.no
                    },
                    success: function(res) {
                        var data = res.data || []
                        vue.table.track = data

                        // draw
                        vue.trackDraw()
                    }
                })
            },
            trackDraw: function() {
                clearTimeout(vue._t_td)
                // context.moveTo(item.x, item.y)
                var list = vue.table.track

                context.clearRect(0, 0, context.canvas.width, context.canvas.height) // clear
                context.strokeStyle = 'rgba(255,0,0, 1)'

                !function loop(i) {
                    vue._t_td = setTimeout(function () {
                        var item = list[i]
                        var next = list[i+1]
                        if (item && next) {
                            context.beginPath()
                            context.moveTo(item.x, item.y)
                            context.lineTo(next.x, next.y)
                            context.stroke()
                            context.closePath()
                        }
                        i<list.length-1 && loop(i+1)
                    }, 120)
                }(0)
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