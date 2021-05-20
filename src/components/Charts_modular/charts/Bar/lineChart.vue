<template>
    <!-- <div @click="draw">123</div> -->
    <div class="line" :id="id"></div>
</template>
<script>
/* eslint-disable */
import * as d3 from "d3";
// import d3Tip from 'd3-tip';
export default {
    props: {
        data: {
            type: Array,
            default: () => {
                return [
                    {
                        PrdRet: 0,
                        RetYM: "2015-10-09T17:05:00"
                    }
                ];
            }
        },
        windowwidth: {
            type: Number,
            default: window.innerWidth
        },
        tooltips: {
            type: Array,
            default: () => {
                return [
                    {
                        key: "標題",
                        fill: "#ffffff",
                        value: "值"
                    }
                ];
            }
        },
        id: {
            type: String,
            default: "line-1"
        },
        listKey: {
            type: String,
            default: 'RetList'
        },
        listItem: {
            type: String,
            default: 'PrdRet'
        },
        hovered: {
            type: Array,
            default: () => {
                return [{
                    isHovered: false,
                    fundColor: '#fafdfe',
                    fundName: ' 施羅德環球基金系列-環球氣候變化策略基金A1股-累積【SD027】 '
                }];
            }
        }
    },
    data: () => ({
        padding: { top: 40, right: 80, bottom: 30, left: 16 },
        Padding_Mobile: { top: 40, right: 65, bottom: 40, left: 20 },
        tickPadding: 30,
        tickPadding_Mobile: 15,
        initStatus: true,
        text1: '一二三四五六七八九十一二',
        text2: '一二三四五六七八九十',
        hoveredFund: [],
    }),
    watch: {
        data: function() {
            this.init(true);
        }
    },
    // props: {
    //     data: {
    //         type: Array,
    //         default: () => {
    //             return [
    //                 {
    //                     PrdRet: 0,
    //                     RetYM: "2015-10-09T17:05:00"
    //                 }
    //             ];
    //         }
    //     },
    //     windowwidth: {
    //         type: Number,
    //         default: window.innerWidth
    //     },
    //     tooltips: {
    //         type: Array,
    //         default: () => {
    //             return [
    //                 {
    //                     key: "標題",
    //                     fill: "#ffffff",
    //                     value: "值"
    //                 }
    //             ];
    //         }
    //     },
    //     id: {
    //         type: String,
    //         default: "line-1"
    //     },
    //     listKey: {
    //         type: String,
    //         default: 'RetList'
    //     },
    //     listItem: {
    //         type: String,
    //         default: 'PrdRet'
    //     },
    //     hovered: {
    //         type: Array,
    //         default: () => {
    //             return [
    //                 {
    //                     isHovered: false,
    //                     fundColor: '#fafdfe',
    //                     fundName: ' 施羅德環球基金系列-環球氣候變化策略基金A1股-累積【SD027】 '
    //                 }
    //             ];
    //         }
    //     }
    // },
    methods: {
        draw: function() {

            let vm = this;
            let f = d3.format(",");
            let tooltips = this.tooltips;
            //使svg大小與外部容器同寬高，可用css控制外部容器以調整大小
            let parseDate = d3.timeParse('%Y/%m/01');
            // let parseDate = d3.timeParse('%Y%m');
            let newData = JSON.parse(JSON.stringify(this.data));
            console.log(newData);
            newData.forEach((item) => {
                item[this.listKey].forEach((el) => {
                    el.RetYM = parseDate(el.RetYM);
                })
            })

            // console.log(newData);
            // let newData = this.data;
            let svg = d3
                .select(`#${vm.id}`)
                .append("svg")
                .attr("class", "svg")
                .attr("width", document.querySelector(`#${vm.id}`).offsetWidth)
                .attr(
                    "height",
                    document.querySelector(`#${vm.id}`).offsetHeight
                );
            //選擇svg
            // let setAxis = d3.select(`#${vm.id}`).select('.svg')

            //判斷螢幕大小
            let isSmallScreen = window.innerWidth < 1024;
            let padding = isSmallScreen ? this.Padding_Mobile : this.padding;
            let width = +svg.attr("width") - padding.left - padding.right;
            // console.log('width:', width)
            let height = +svg.attr("height") - padding.top - padding.bottom;
            // console.log('height:', height)
            let yTickPadding = isSmallScreen
                ? this.tickPadding_Mobile
                : this.tickPadding;

            //定義坐標軸
            const x = d3.scaleTime().range([0, width]);
            x.domain(d3.extent(newData[0][this.listKey], d => {
                return d.RetYM
            }))

            let totalRangeArray = [];
            let colorArray = []
            newData.forEach((item) => {
                item[this.listKey].forEach((seriesItem) => {
                    totalRangeArray.push(seriesItem)
                    colorArray.push({
                        RetYM: seriesItem.RetYM,
                        PrdRet: seriesItem.PrdRet,
                        color: item.color
                    })
                })
            })

            let y = d3.scaleLinear().domain([
                d3.min(totalRangeArray, (d, i) => {
                    return d[this.listItem] - 1;
                }),
                d3.max(totalRangeArray, (d, i) => {
                    return d[this.listItem] + 1;
                })
            ]).range([height, 0]);

            let yAxis_fn = d3
                .axisRight(y)
                .tickFormat(function(d) {
                    return d + '%';
                })
                .tickSize([-width])
                .tickPadding([yTickPadding - 0]);

            let yAxis_fn_left = d3
                .axisLeft(y)
                .tickFormat(function(d) { return d + '%'; })
                .tickSize([0])
                .tickPadding([yTickPadding - 0]);

            let yAxis_left = svg
                .append("g")
                .attr("class", "yaxis")
                .attr("class", "yaxisRight")
                .attr("transform", "translate(" +
                    (isSmallScreen ?
                        (padding.left + 50 + width) : (padding.left + 60 + width)) +
                    "," + padding.top + ")"
                )
                .call(yAxis_fn_left);

            let yAxis = svg
                .append("g")
                .attr("class", "yaxis")
                .attr("class", "yaxisRight")
                .attr(
                    "transform",
                    "translate(" +
                    (padding.left + width) +
                    "," +
                    padding.top +
                    ")"
                )
                .call(yAxis_fn);

            svg.append('text')
                .text('累積報酬率')
                .attr("class", "yaxisRight__text")
                .attr("writing-mode", "tb")
                .attr(
                    "transform",
                    "translate("
                    + (isSmallScreen ? (width + 3.5 * padding.left) : (width + 4.5 * padding.left)) + ","
                    + (isSmallScreen ?
                        (height - 2.5 * padding.top) : (height - 4 * padding.top - padding.bottom)) + ")"
                )
                .style("font-size", "12px")
                .style("fill", "#888888")

            svg.selectAll(".tick")
                .select("line")
                .attr("stroke", "rgba(0,0,0,0.1)");
            // svg.select(".leftStroke")
            //     .selectAll(".tick")
            //     .attr("opacity", 1);

            // svg.select(".bottomStroke")
            //     .selectAll(".tick")
            //     .attr("opacity", 1);

            yAxis.select(".domain").attr("stroke", "none");
            yAxis_left.select(".domain").attr("stroke", "none");
            yAxis.selectAll(".tick").select('text').attr("opacity", 0);

            let xAxis__fn = d3
                .axisBottom(x)
                .ticks(5)
                .tickSize([0])
                .tickFormat(d3.timeFormat('%Y/%m'));

            let xAxis = svg
                .append('g')
                .attr('transform', "translate(" + (padding.left) + "," + (padding.top - 20) + ")")
                .attr('class', 'xaxis')
                .call(xAxis__fn);

            xAxis.select(".domain").attr("stroke", "none");
            xAxis.selectAll(".tick").select('text').attr("style", 'transform: translate(15px)');
            ////////////////////////////////////////////////////////
            //畫線
            let line = d3
                .line()
                .x(d => x(d.RetYM))
                .y(d => y(d[this.listItem]))
            // .curve(d3.curveCatmullRom.alpha(1)) //線段弧度
            let lineArea = d3.area()
                .x(d => x(d.RetYM))
                .y0(d => y(d3.min(totalRangeArray, (d, i) => {
                    return d[this.listItem] - 1;
                })))
                .y1(d => y(d[this.listItem]))
            //////////////////左坐標軸
            let yAxisScale_fn = d3
                .axisRight(y)
                .tickSize([0])
            let yAxisScale = svg
                .append("g")
                .attr("class", 'leftStroke')
                .attr(
                    "transform",
                    "translate(" +
                    (padding.left) +
                    "," +
                    (padding.top) +
                    ")"
                )
                .call(yAxisScale_fn);
            /////////////////////

            let lineAreas = svg.append('g').attr('class', 'areas');
            let lines = svg.append('g').attr('class', 'lines');

            function tweenDash() {
                let l = this.getTotalLength(),
                    i = d3.interpolateString("0," + l, l + "," + l);
                return function(t) {
                    return i(t);
                };
            }
            function transition(path) {
                path.transition()
                    .duration(vm.initStatus ? 1000 : 0)
                    .attrTween("stroke-dasharray", tweenDash);
            }
            let rateLine =
                lines.selectAll('.line-group')
                    .data(newData)
                    .enter()
                    .append('g')
                    .attr('class', (d, i) => `line-group${i}`)
                    .append('path')
                    .attr('class', 'line')
                    .attr('d', d => line(d[this.listKey]))
                    .attr("transform",
                        "translate(" + padding.left + "," + padding.top + ")"
                    )
                    .style('stroke', d => d.color)
                    .style("stroke-width", "1px")
                    .style('fill', 'none')
                    .call(transition)

            ////////////////畫點點

            if (this.listKey === 'RList') {
                let sensorLine =
                    lines.selectAll('.line-group')
                        .data(newData)
                        .enter()
                        .append('g')
                        .attr('class', 'sensor-group')
                        .append('path')
                        .attr('class', 'line')
                        .attr('d', d => line(d[this.listKey]))
                        .attr("transform",
                            "translate(" + padding.left + "," + padding.top + ")"
                        )
                        .style('fill', 'none')
                        .style('stroke', 'transparent')
                        .style("stroke-width", "10px")
                // .style('opacity', '0')

                sensorLine.on('mouseenter', (e, i) => {
                    //重新mapping點的資料
                    // console.log(e);
                    this.hoveredFund = []
                    let isBelow768 = window.innerWidth < 768 ? true : false
                    let prdName = e.PrdName
                    if (prdName.length > 47 && isBelow768 === false) {
                        prdName = prdName.slice(0, 47) + "..."
                    } else if (prdName.length > 15 && isBelow768 === true) {
                        prdName = prdName.slice(0, 15) + "..."
                    } else {
                        prdName = e.PrdName
                    }
                    this.hoveredFund.push({
                        isHovered: true,
                        fundColor: e.color,
                        fundName: prdName
                    })
                    this.$emit('update', this.hoveredFund)
                    d3.select(`.line-group${i}`).select('path').style("stroke-width", "2px")

                    let circleData = []
                    e.RList.forEach((item) => {
                        circleData.push({
                            RetYM: item.RetYM,
                            PrdRet: item.PrdRet,
                            color: e.color
                        })
                    })
                    // ///////點點在此!
                    lines.selectAll('.line-group')
                        .data(circleData)
                        .enter()
                        // .append('g')
                        // .attr('class', 'circle-group')
                        // .attr('class', 'circle')
                        .append('circle')
                        .attr('cx', d => x(d.RetYM) + padding.left)
                        .attr('cy', d => y(d[this.listItem]) + padding.top)
                        .attr('r', 3)
                        // .style('stroke-width', '1px')
                        .style('fill', d => d.color)
                        .style('opacity', '0')
                        .attr('pointer-events', 'none')
                        .transition()
                        .duration(300)
                        .ease(d3.easeLinear)
                        .delay((d, i) => {
                            return 100 * i
                        })
                        .style('opacity', '1')

                    lines.selectAll('.line-group')
                        .data(circleData)
                        .enter()
                        // .append('g')
                        // .attr('class', 'circle-group')
                        // .attr('class', 'circle')
                        .append('circle')
                        .attr('cx', d => x(d.RetYM) + padding.left)
                        .attr('cy', d => y(d[this.listItem]) + padding.top)
                        .attr('r', 6)
                        // .style('stroke-width', '1px')
                        .style('fill', d => d.color)
                        .style('opacity', '0')
                        .attr('pointer-events', 'none')

                        .transition()
                        .duration(300)
                        .delay((d, i) => {
                            return 100 * i
                        })
                        .style('opacity', '0.3')

                    // //偵測tooltip位置
                    // let getMousePos = (event) => {
                    //     const e = event || window.event;
                    //     // console.log('e:', e)
                    //     const scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                    //     const scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                    //     let x = e.pageX || e.clientX + scrollX;
                    //     let y = e.pageY || e.clientY + scrollY;
                    //     // console.log('一開始的{ x, y }', { x, y })

                    //     let screenSize
                    //     if (window.innerWidth >= 1280) {
                    //         screenSize = 'laptop'
                    //     } else if (window.innerWidth >= 768) {
                    //         screenSize = 'tablet'
                    //     } else {
                    //         screenSize = 'mobile'
                    //     }
                    //     switch (screenSize) {
                    //         case 'mobile':
                    //             x = x - width / 2
                    //             if (x < 0) {
                    //                 x = 0
                    //                 // console.log('x1');
                    //             }
                    //             y = y - 4.5 * (height + padding.top + padding.bottom)
                    //             if (y > 190) {
                    //                 y = 110
                    //             }
                    //             if (y < 0) {
                    //                 y = 100
                    //                 // y += height / 2
                    //             }
                    //             // console.log('1', window.innerWidth);
                    //             break;
                    //         case 'tablet':
                    //             x = x - padding.left - padding.right
                    //             y = y - 3 * (height) - padding.top - padding.bottom
                    //             if (x < 20) {
                    //                 x = 20
                    //             } else if (x > 600) {
                    //                 x = 550
                    //             }
                    //             if (y > 300) {
                    //                 y = 200
                    //             } else if (y < 0) {
                    //                 y = 100
                    //             }
                    //             // console.log('2', window.innerWidth);
                    //             break;
                    //         case 'laptop':
                    //             x = x - width - padding.left - padding.right
                    //             y = y - height - padding.bottom - padding.top
                    //             if (x < 50) {
                    //                 x = 30
                    //             } else if (x > 550) {
                    //                 x -= 100
                    //             }
                    //             if (y > 300) {
                    //                 y = 230
                    //             }
                    //             // console.log('3', window.innerWidth);
                    //             break;
                    //     }

                    //     // console.log('{ x, y }', { x, y })
                    //     return { 'x': x, 'y': y };
                    // }

                    // //基金名稱字串分割
                    // let lineWrap = (e) => {
                    //     let text = e.PrdName
                    //     let len = text.length
                    //     this.text1 = ''
                    //     this.text2 = ''
                    //     if (len <= 10) {
                    //         this.text1 = text
                    //         return
                    //     }
                    //     if (len > 10) {
                    //         this.text1 = text.slice(0, 9)
                    //         this.text2 = text.slice(9, 20)
                    //         if (len > 20) {
                    //             this.text2 = text.slice(10, 19) + "..."
                    //         }
                    //         return
                    //     }
                    // }
                    // lineWrap(e)
                    // svg.append('g')
                    //     .attr('class', 'tooltips')
                    //     .attr('transform',
                    //         `translate(${getMousePos(event).x},
                    //         ${getMousePos(event).y})`)
                    //     .append('rect')
                    //     .attr('fill', '#dce6f0')
                    //     .attr('width', '150px')
                    //     .attr('height', '65px')
                    //     .attr('x', '-10px')
                    //     .attr('y', '-10px')
                    //     .attr('rx', 10)
                    //     .attr('ry', 10)
                    //     .attr('filter', 'url(#f1)')
                    // svg.select('.tooltips')
                    //     .append('rect')
                    //     .attr('width', '150px')
                    //     .attr('height', '65px')
                    //     .style('fill', '#555')
                    //     .style('opacity', '.7')
                    //     .style('stroke', '#dce6f0')
                    //     .attr('rx', 10)
                    //     .attr('ry', 10)
                    // svg.select('.tooltips')
                    //     .append('circle')
                    //     .attr('cx', 18)
                    //     .attr('cy', 24)
                    //     .attr('r', 5)
                    //     .style('stroke-width', '1px')
                    //     .style('fill', e.color)
                    // svg.select('.tooltips')
                    //     .append('text')
                    //     .attr('width', 100)
                    //     .attr('text-anchor', 'center')
                    //     .attr('x', 26)
                    //     .attr('y', 29)
                    //     .attr('fill', '#fff')
                    //     .style('font-size', '12px')
                    //     .text(this.text1)
                    // svg.select('.tooltips')
                    //     .append('text')
                    //     .attr('width', 100)
                    //     .attr('text-anchor', 'center')
                    //     .attr('x', 13)
                    //     .attr('y', 47)
                    //     .attr('fill', '#fff')
                    //     .style('font-size', '12px')
                    //     .text(this.text2)

                }).on('mouseleave', (d, i) => {
                    // d3.select(".tooltips").remove()
                    d3.selectAll("circle").remove()
                    d3.select(`.line-group${i}`)
                        .select('path').style("stroke-width", "1px")
                    // setTimeout(() => {

                    this.hoveredFund = []
                    this.hoveredFund.push({
                        isHovered: false,
                        fundColor: '',
                        fundName: ''
                    })
                    this.$emit('update', this.hoveredFund)
                    // }, 1000)

                })

            }


            lineAreas
                .selectAll('.line-group')
                .data(newData)
                .enter()
                .append('g')
                .attr('class', 'area-group')
                .append('path')
                .attr('class', 'area')
                .attr('d', d => lineArea(d[this.listKey]))
                .attr(
                    "transform",
                    "translate(" + padding.left + "," + padding.top + ")"
                )
                .style('stroke', 'none')
                .style('fill', (d, i) => d.color)
                .style('opacity', '0.1')



            ///////////////////////////底坐標軸
            let xAxisScale_fn = d3
                .axisBottom(x)
                .ticks(0)
                .tickFormat(d3.timeFormat('%Y/%m'))
                .tickSize([0])
            let xAxisScale = svg
                .append("g")
                .attr("class", 'bottomStroke')
                .attr(
                    "transform",
                    "translate(" +
                    (padding.left) +
                    "," +
                    (height + padding.top) +
                    ")"
                )
                .call(xAxisScale_fn);
            svg.select(".leftStroke")
                .selectAll(".tick")
                .attr("opacity", 0);

            svg.select(".bottomStroke")
                .selectAll(".tick")
                .attr("opacity", 0);
            /////////////////////////////////////////

        },
        init: function(animation) {
            let vm = this;
            d3.select(`#${vm.id}`)
                .select(".svg")
                .remove();
            this.draw();

        }
    },
    mounted: function() {
        this.init(true);
        if (this.isMobile()) {
            window.addEventListener("orientationchange", this.init);
        } else {
            window.addEventListener("resize", this.init);
        }
    },
    destroyed() {
        if (this.isMobile()) {
            window.removeEventListener("orientationchange", this.init);
        } else {
            window.removeEventListener("resize", this.init);
        }
    }
};
</script>
<style lang="scss" scoped>
text {
    font-family: inherit;
    font-size: 12px;
}
.line {
    width: 100%;
    height: 100%;
    min-height: 290px;
}
.yaxis path {
    stroke: none;
}
svg {
    overflow: inherit;
}
.circle {
    animation: showCircle 2s linear infinite;
}
@keyframes showCircle {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
