/**
 * @author pengys5
 */
var sliceType = "day";

define(["jquery", "moment", "text!timeAxisHtml", "rangeSlider", "daterangepicker", "alarm", "dagDraw", "text!dagHtml"], function ($, moment, timeAxisHtml, rangeSlider, daterangepicker, alarm, dagDraw, dagHtml) {
    var minuteSliceType = "minute";
    var hourSliceType = "hour";
    var daySliceType = "day";

    var isAutoUpdate = false;
    var slider;

    function create(divId) {
        $("#" + divId).html(timeAxisHtml);

        $("#isUpdateBtn").click(function () {
            autoUpdate();
        });

        $("#minuteBtn").click(function () {
            sliceTypeSelect(minuteSliceType);
        });
        $("#hourBtn").click(function () {
            sliceTypeSelect(hourSliceType);
        });
        $("#dayBtn").click(function () {
            sliceTypeSelect(daySliceType);
        });

        _resize();
        createTimeAxis();
        bindDayRangePicker();
    }

    function autoUpdate() {
        if (isAutoUpdate) {
            $("#isUpdateBtn").removeClass("btn-info").addClass("btn-default");
            isAutoUpdate = false;
            dagDraw.stopAutoUpdate();
            enableOtherBtn();
        } else {
            $("#isUpdateBtn").removeClass("btn-default").addClass("btn-info");
            isAutoUpdate = true;
            dagDraw.startAutoUpdate();
            sliceTypeSelect(daySliceType);
            disableOtherBtn();
        }
    }

    function disableOtherBtn() {
        $("#dataRangeBtn").attr({"disabled": "disabled"}).unbind("click");
        $("#minuteBtn").attr({"disabled": "disabled"}).unbind("click");
        $("#hourBtn").attr({"disabled": "disabled"}).unbind("click");
        $("#dayBtn").attr({"disabled": "disabled"}).unbind("click");
    }

    function enableOtherBtn() {
        $("#dataRangeBtn").removeAttr("disabled");
        bindDayRangePicker();

        $("#minuteBtn").removeAttr("disabled").click(function () {
            sliceTypeSelect(minuteSliceType);
        });

        $("#hourBtn").removeAttr("disabled").click(function () {
            sliceTypeSelect(hourSliceType);
        });

        $("#dayBtn").removeAttr("disabled").click(function () {
            sliceTypeSelect(daySliceType);
        });
    }

    function sliceTypeSelect(sliceTypeIn) {
        if (sliceTypeIn == minuteSliceType) {
            $("#minuteBtn").removeClass("btn-default").addClass("btn-success");
            $("#hourBtn").removeClass("btn-success").addClass("btn-default");
            $("#dayBtn").removeClass("btn-success").addClass("btn-default");
            sliceType = minuteSliceType;
            bindMinuteDatePicker();
        } else if (sliceTypeIn == hourSliceType) {
            $("#hourBtn").removeClass("btn-default").addClass("btn-success");
            $("#minuteBtn").removeClass("btn-success").addClass("btn-default");
            $("#dayBtn").removeClass("btn-success").addClass("btn-default");
            sliceType = hourSliceType;
            bindHourDatePicker();
        } else {
            $("#dayBtn").removeClass("btn-default").addClass("btn-success");
            $("#hourBtn").removeClass("btn-success").addClass("btn-default");
            $("#minuteBtn").removeClass("btn-success").addClass("btn-default");
            sliceType = daySliceType;
            bindDayRangePicker();
        }
    }

    function createTimeAxis() {
        var rangeDate = [];
        for (var i = 30; i >= 0; i--) {
            rangeDate.push(moment().subtract(i, 'days').format("YYYY/MM/DD"))
        }

        $("#timeAxisComponentDiv").ionRangeSlider({
            type: 'double',
            grid: false,
            values: rangeDate,
            onChange: function (data) {
                console.log(data.from_value + " : " + data.to_value);
                console.log("sliceType: " + sliceType)

                if (sliceType == minuteSliceType) {
                    var startTime = moment(data.from_value, "YYYY/MM/DD HH:mm").format("YYYYMMDDHHmm");
                    var endTime = moment(data.to_value, "YYYY/MM/DD HH:mm").format("YYYYMMDDHHmm");
                    console.log("startTime: " + startTime + ", endTime: " + endTime);
                    dagDraw.loadDateRangeDag(minuteSliceType, startTime, endTime);
                } else if (sliceType == hourSliceType) {
                    var startTime = moment(data.from_value, "YYYY/MM/DD HH").format("YYYYMMDDHHmm");
                    var endTime = moment(data.to_value, "YYYY/MM/DD HH").format("YYYYMMDDHHmm");
                    console.log("startTime: " + startTime + ", endTime: " + endTime);
                    dagDraw.loadDateRangeDag(hourSliceType, startTime, endTime);
                } else if (sliceType == daySliceType) {
                    var startTime = moment(data.from_value, "YYYY/MM/DD").format("YYYYMMDDHHmm");
                    var endTime = moment(data.to_value, "YYYY/MM/DD").format("YYYYMMDDHHmm");
                    console.log("startTime: " + startTime + ", endTime: " + endTime);
                    dagDraw.loadDateRangeDag(daySliceType, startTime, endTime);
                }
            }
        });
        slider = $("#timeAxisComponentDiv").data("ionRangeSlider");
    }

    function updateTimeAxis(rangeDate, from, to) {
        slider.update({
            type: 'double',
            grid: false,
            prefix: "",
            postfix: "",
            from: from,
            to: to,
            values: rangeDate
        });
    }

    function bindDayRangePicker() {
        var rangeDateTemp = [];
        for (var i = 29; i >= 0; i--) {
            rangeDateTemp.push(moment().subtract(i, 'days').format("YYYY/MM/DD"))
        }
        updateTimeAxis(rangeDateTemp, 0, rangeDateTemp.length - 1);

        var startDate = moment(rangeDateTemp[0], "YYYY/MM/DD").format("YYYYMMDD");
        var endDate = moment(rangeDateTemp[rangeDateTemp.length - 1], "YYYY/MM/DD").format("YYYYMMDD");
        dagDraw.loadDateRangeDag(daySliceType, startDate + "0000", endDate + "0000");

        alarm.loadCostData(daySliceType, startDate + "0000", endDate + "0000");

        $('#dateRangeInput').daterangepicker({
            startDate: moment().subtract(30, 'days'),
            endDate: moment(),
            minDate: moment().subtract(30, 'days'),
            maxDate: moment(),
            "opens": "left"
        }, function (start, end, label) {
            var fromDate = start.format("YYYY/MM/DD");
            var toDate = end.format("YYYY/MM/DD");

            var rangeDateTemp = [];
            for (var i = 0; i < 100; i++) {
                var dateTemp = moment(fromDate, "YYYY/MM/DD").add(i, "day").format("YYYY/MM/DD");
                rangeDateTemp.push(dateTemp);
                if (dateTemp == toDate) {
                    break;
                }
            }

            updateTimeAxis(rangeDateTemp, 0, rangeDateTemp.length - 1);

            fromDate = start.format("YYYYMMDD");
            toDate = end.format("YYYYMMDD");
            dagDraw.loadDateRangeDag(daySliceType, fromDate + "0000", toDate + "0000");

            alarm.loadCostData(daySliceType, fromDate + "0000", toDate + "0000");
        });

        $("#dataRangeBtn").click(function () {
            var drp = $('#dateRangeInput').data('daterangepicker');
            drp.show();
        });
    }

    function bindHourDatePicker() {
        var rangeDateTemp = [];
        for (var i = 23; i >= 0; i--) {
            rangeDateTemp.push(moment().subtract(i, 'hours').format("YYYY/MM/DD HH"))
        }
        updateTimeAxis(rangeDateTemp, 0, rangeDateTemp.length - 1);

        var nowDay = moment().format("YYYYMMDD");
        dagDraw.loadDateRangeDag(hourSliceType, nowDay + "0000", nowDay + "2300");

        alarm.loadCostData(hourSliceType, nowDay + "0000", nowDay + "2300");

        $('#dateRangeInput').daterangepicker({
            singleDatePicker: true,
            endDate: moment(),
            maxDate: moment(),
            "opens": "left"
        }, function (start, end, label) {
            var fromDate = start.format("YYYY/MM/DD");

            var rangeDateTemp = [];
            for (var i = 0; i <= 23; i++) {
                if (i < 10) {
                    rangeDateTemp.push(fromDate + " 0" + i);
                } else {
                    rangeDateTemp.push(fromDate + " " + i);
                }
            }
            updateTimeAxis(rangeDateTemp, 0, 23);

            fromDate = start.format("YYYYMMDD");
            dagDraw.loadDateRangeDag(hourSliceType, fromDate + "0000", fromDate + "2300");

            alarm.loadCostData(hourSliceType, fromDate + "0000", fromDate + "2300");
        });

        $("#dataRangeBtn").click(function () {
            var drp = $('#dateRangeInput').data('daterangepicker');
            drp.show();
        });
    }

    function bindMinuteDatePicker() {
        var rangeDateTemp = [];
        for (var i = 0; i <= 59; i++) {
            if (i < 10) {
                rangeDateTemp.push(moment().format("YYYY/MM/DD HH:") + "0" + i);
            } else {
                rangeDateTemp.push(moment().format("YYYY/MM/DD HH:") + i);
            }
        }
        var minute = moment().format("mm");

        updateTimeAxis(rangeDateTemp, minute, rangeDateTemp.length - 1);

        var nowDay = moment().format("YYYYMMDDHH");
        dagDraw.loadDateRangeDag(minuteSliceType, nowDay + "00", nowDay + "59");

        alarm.loadCostData(minuteSliceType, nowDay + "00", nowDay + "59");


        $("#dateRangeInput").val(moment().format("MM/DD/YYYY HH:mm"));

        $('#dateRangeInput').daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            timePicker24Hour: true,
            timePickerSeconds: false,
            maxDate: moment(),
            "opens": "left",
            locale: {
                format: 'MM/DD/YYYY HH:mm'
            }
        }, function (start, end, label) {
            var fromDate = start.format("YYYY/MM/DD HH");
            var minute = start.format("mm");

            var rangeDateTemp = [];
            for (var i = 0; i <= 59; i++) {
                if (i < 10) {
                    rangeDateTemp.push(fromDate + ":0" + i);
                } else {
                    rangeDateTemp.push(fromDate + ":" + i);
                }
            }
            updateTimeAxis(rangeDateTemp, Number(minute), rangeDateTemp.length - 1);

            fromDate = start.format("YYYYMMDDHH");
            dagDraw.loadDateRangeDag(minuteSliceType, fromDate + minute, fromDate + "59");

            alarm.loadCostData(minuteSliceType, fromDate + minute, fromDate + "59");
        });

        $("#dataRangeBtn").click(function () {
            var drp = $('#dateRangeInput').data('daterangepicker');
            drp.show();
        });
    }

    function _resize() {
        var width = $("#axisRowDiv").width();
        $("#axisDiv").width(width - 150);
    }

    $(window).resize(function () {
        _resize();
    });

    return {
        create: create
    }
});