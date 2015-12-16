window.HuangLi = window.HuangLi || {};

(function () {
    var mobile = {
        platform: '',
        version: 0,
        Android: function () {
            return this.platform === 'Android';
        },
        iOS: function () {
            return this.platform === 'iOS';
        },
        init: function () {
            var ua = navigator.userAgent;
            if (ua.match(/Android/i)) {
                this.platform = 'Android';
                this.version = parseFloat(ua.slice(ua.indexOf("Android") + 8));
            }
            else if (ua.match(/iPhone|iPad|iPod/i)) {
                this.platform = 'iOS';
                this.version = parseFloat(ua.slice(ua.indexOf("OS") + 3));
            }
        }
    };
    mobile.init();
    this.mobile = mobile;
} ());

(function() {
    /**
     * 动态加载js文件
     * @param  {string}   url      js文件的url地址
     * @param  {Function} callback 加载完成后的回调函数
     */
    var _getScript = function(url, callback) {
        var head = document.getElementsByTagName('head')[0],
            js = document.createElement('script');

        js.setAttribute('type', 'text/javascript'); 
        js.setAttribute('src', url); 

        head.appendChild(js);

        //执行回调
        var callbackFn = function(){
			if(typeof callback === 'function'){
				callback();
			}
        };

        if (document.all) { //IE
            js.onreadystatechange = function() {
                if (js.readyState == 'loaded' || js.readyState == 'complete') {
                    callbackFn();
                }
            }
        } else {
            js.onload = function() {
                callbackFn();
            }
        }
    }

    //如果使用的是zepto，就添加扩展函数
    if(Zepto){
        $.getScript = _getScript;
    }
})();


(function () {
    var Footprint = function () {};
      // Default template settings, uses ASP/PHP/JSP delimiters, change the
      // following template settings to use alternative delimiters.
    var templateSettings = {
        evaluate : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g
    };

      // JavaScript micro-templating, similar to John Resig's implementation.
      // Underscore templating handles arbitrary delimiters, preserves whitespace,
      // and correctly escapes quotes within interpolated code.
    Footprint.compile = function(str, settings) {
        var c = settings || templateSettings;
        var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
          'with(obj||{}){__p.push(\'' +
          str.replace(/\\/g, '\\\\')
             .replace(/'/g, "\\'")
             .replace(c.interpolate, function(match, code) {
               return "'," + code.replace(/\\'/g, "'") + ",'";
             })
             .replace(c.evaluate || null, function(match, code) {
               return "');" + code.replace(/\\'/g, "'")
                                  .replace(/[\r\n\t]/g, ' ') + "__p.push('";
             })
             .replace(/\r/g, '\\r')
             .replace(/\n/g, '\\n')
             .replace(/\t/g, '\\t')
             + "');}return __p.join('');";
        return new Function('obj', tmpl);
    };

    // Preserves template method for compatible with legacy call.
    Footprint.template = function (str, data) {
        var compilied = Footprint.compile(str);
        return compilied(data);
    };
  
    if (typeof exports !== "undefined") {
        exports.Footprint = Footprint;
    } else {
        window.Footprint = Footprint;
    }
	
	//如果使用的是zepto，就添加扩展函数
    if(Zepto){
        $.template = Footprint.template;
    }
}());

var Calendar = (function(){

    /**
     * 1890 - 2100 年的农历数据
     * 数据格式：[0,2,9,21936]
     * [闰月所在月，0为没有闰月; *正月初一对应公历月; *正月初一对应公历日; *农历每月的天数的数组（需转换为二进制,得到每月大小，0=小月(29日),1=大月(30日)）;]
     */
    var lunarInfo = [[2,1,21,22184],[0,2,9,21936],[6,1,30,9656],[0,2,17,9584],[0,2,6,21168],[5,1,26,43344],[0,2,13,59728],[0,2,2,27296],[3,1,22,44368],[0,2,10,43856],[8,1,30,19304],[0,2,19,19168],[0,2,8,42352],[5,1,29,21096],[0,2,16,53856],[0,2,4,55632],[4,1,25,27304],[0,2,13,22176],[0,2,2,39632],[2,1,22,19176],[0,2,10,19168],[6,1,30,42200],[0,2,18,42192],[0,2,6,53840],[5,1,26,54568],[0,2,14,46400],[0,2,3,54944],[2,1,23,38608],[0,2,11,38320],[7,2,1,18872],[0,2,20,18800],[0,2,8,42160],[5,1,28,45656],[0,2,16,27216],[0,2,5,27968],[4,1,24,44456],[0,2,13,11104],[0,2,2,38256],[2,1,23,18808],[0,2,10,18800],[6,1,30,25776],[0,2,17,54432],[0,2,6,59984],[5,1,26,27976],[0,2,14,23248],[0,2,4,11104],[3,1,24,37744],[0,2,11,37600],[7,1,31,51560],[0,2,19,51536],[0,2,8,54432],[6,1,27,55888],[0,2,15,46416],[0,2,5,22176],[4,1,25,43736],[0,2,13,9680],[0,2,2,37584],[2,1,22,51544],[0,2,10,43344],[7,1,29,46248],[0,2,17,27808],[0,2,6,46416],[5,1,27,21928],[0,2,14,19872],[0,2,3,42416],[3,1,24,21176],[0,2,12,21168],[8,1,31,43344],[0,2,18,59728],[0,2,8,27296],[6,1,28,44368],[0,2,15,43856],[0,2,5,19296],[4,1,25,42352],[0,2,13,42352],[0,2,2,21088],[3,1,21,59696],[0,2,9,55632],[7,1,30,23208],[0,2,17,22176],[0,2,6,38608],[5,1,27,19176],[0,2,15,19152],[0,2,3,42192],[4,1,23,53864],[0,2,11,53840],[8,1,31,54568],[0,2,18,46400],[0,2,7,46752],[6,1,28,38608],[0,2,16,38320],[0,2,5,18864],[4,1,25,42168],[0,2,13,42160],[10,2,2,45656],[0,2,20,27216],[0,2,9,27968],[6,1,29,44448],[0,2,17,43872],[0,2,6,38256],[5,1,27,18808],[0,2,15,18800],[0,2,4,25776],[3,1,23,27216],[0,2,10,59984],[8,1,31,27432],[0,2,19,23232],[0,2,7,43872],[5,1,28,37736],[0,2,16,37600],[0,2,5,51552],[4,1,24,54440],[0,2,12,54432],[0,2,1,55888],[2,1,22,23208],[0,2,9,22176],[7,1,29,43736],[0,2,18,9680],[0,2,7,37584],[5,1,26,51544],[0,2,14,43344],[0,2,3,46240],[4,1,23,46416],[0,2,10,44368],[9,1,31,21928],[0,2,19,19360],[0,2,8,42416],[6,1,28,21176],[0,2,16,21168],[0,2,5,43312],[4,1,25,29864],[0,2,12,27296],[0,2,1,44368],[2,1,22,19880],[0,2,10,19296],[6,1,29,42352],[0,2,17,42208],[0,2,6,53856],[5,1,26,59696],[0,2,13,54576],[0,2,3,23200],[3,1,23,27472],[0,2,11,38608],[11,1,31,19176],[0,2,19,19152],[0,2,8,42192],[6,1,28,53848],[0,2,15,53840],[0,2,4,54560],[5,1,24,55968],[0,2,12,46496],[0,2,1,22224],[2,1,22,19160],[0,2,10,18864],[7,1,30,42168],[0,2,17,42160],[0,2,6,43600],[5,1,26,46376],[0,2,14,27936],[0,2,2,44448],[3,1,23,21936],[0,2,11,37744],[8,2,1,18808],[0,2,19,18800],[0,2,8,25776],[6,1,28,27216],[0,2,15,59984],[0,2,4,27424],[4,1,24,43872],[0,2,12,43744],[0,2,2,37600],[3,1,21,51568],[0,2,9,51552],[7,1,29,54440],[0,2,17,54432],[0,2,5,55888],[5,1,26,23208],[0,2,14,22176],[0,2,3,42704],[4,1,23,21224],[0,2,11,21200],[8,1,31,43352],[0,2,19,43344],[0,2,7,46240],[6,1,27,46416],[0,2,15,44368],[0,2,5,21920],[4,1,24,42448],[0,2,12,42416],[0,2,2,21168],[3,1,22,43320],[0,2,9,26928],[7,1,29,29336],[0,2,17,27296],[0,2,6,44368],[5,1,26,19880],[0,2,14,19296],[0,2,3,42352],[4,1,24,21104],[0,2,10,53856],[8,1,30,59696],[0,2,18,54560],[0,2,7,55968],[6,1,27,27472],[0,2,15,22224],[0,2,5,19168],[4,1,25,42216],[0,2,12,42192],[0,2,1,53584],[2,1,21,55592],[0,2,9,54560]];
    var monthDays = [31,30,31,30,31,30,31,31,30,31,30,31];
    var monthCn=['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    var lunarMonthDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十', '卅一'];
    var hlurl = 'http://cdn.tuijs.com/js/';
    var selectCalendarType = 0;
    var typeArr = [['year', 'month', 'date']];
    var hlMinYear = 2008;
	var hlMaxYear = 2020;
	var minYear = 1891;//最小年限
	var maxYear = 2100;//最大年限
	var itemTemp = [
		'<div class="date_item<%=itemCls%>" data-index="<%=index%>">',
		'	<span class="date_icon<%=iconCls%>"><%=iconText%></span>',
		'	<span class="date_day"><%=day%></span>',
		'	<span class="date_lunar<%=fetvCls%>"><%=lunar%></span>',
		'</div>'
	];
	
	var now = new Date();
	var current = null;
	var DATA = null;
	var panel = [0,1]; //当前显示面板panel[0]
	var pageWidth = 0; //设备宽度
	var slideIng = false; //是否滑动中
	var timer = -1;
    var Today = new Date();
    var tY = Today.getFullYear();
    var tM = Today.getMonth();
    var tD = Today.getDate();

	var formateDayD4 = function(month,day){
		month = month+1;
		month = month<10 ? '0'+month : month;
		day = day<10 ? '0'+day : day;
		return 'd'+month+day;
	};
	
	function formatDate(){
		if(!current)return '';
		var year = current.year;
		var month = current.month;
		var day = current.day;
		month = month<10 ? '0'+month : month;
		day = day<10 ? '0'+day : day;
		return year+'-'+month+'-'+day;
	};
	
	function setCurrentByNow(year,month,day,pos){
		current = {
			year : year || now.getFullYear(),
			month : month || now.getMonth()+1,
			day : day || now.getDate(),
			pos : pos || 0
		};
	};
	
	//黄历
	function getHL(){
		if(HuangLi['y'+current.year]){ //该年已有黄历数据
			var hl = HuangLi['y'+current.year][formateDayD4(current.month,current.day)];
			showHL(hl);
		}else if(current.year>=hlMinYear && current.year<=hlMaxYear){
			$.getScript(hlurl+'hl'+current.year+'.min.js',function(){
				var hl = HuangLi['y'+current.year][formateDayD4(current.month,current.day)];
				showHL(hl);
			});
		}
	}
	function showHL(hl){
		if(hl){
			$('.hl_y_content').html(hl.y);
			$('.hl_j_content').html(hl.j);
			$('.date_hl').show();
		}else{
			$('.date_hl').hide();
		}
	};
	
	function showInfo(_this){
		var currentLunar = LunarCalendar.solarToLunar(current.year,current.month,current.day);
		var weekday = new Date(current.year,current.month-1,current.day).getDay();
		var weekList = ['日','一','二','三','四','五','六'];
		$('#toolbar h1').html(formatDate());
		$('.date_lunar_info').html('农历'+currentLunar.lunarMonthName+currentLunar.lunarDayName+' 星期'+weekList[weekday]);
		$('.date_gan_zhi').html(currentLunar.GanZhiYear+'年['+currentLunar.zodiac+'年] '+currentLunar.GanZhiMonth+'月 '+currentLunar.GanZhiDay+'日');
		
		var fetv = [];
		if(currentLunar.term) fetv.push(currentLunar.term);
		if(currentLunar.lunarFestival) fetv.push(currentLunar.lunarFestival);
		if(currentLunar.solarFestival) fetv.push(currentLunar.solarFestival.split(' '));
		$('.date_fetv').html(fetv.length>0 ? '节假日纪念日：'+fetv.join('，') : '');

        //公历
        document.getElementById('SY').selectedIndex=current.year-1900;
        document.getElementById('SM').selectedIndex=current.month - 1;

        resetDays(current.month);
        document.getElementById('SD').selectedIndex=current.day - 1;

        //农历
        document.getElementById('lunar-SY').selectedIndex=currentLunar.lunarYear-1899;

        resetLunarMonth(currentLunar.lunarYear);
        document.getElementById('lunar-SM').selectedIndex=currentLunar.lunarMonth - 1;

        resetLunarDays(currentLunar.lunarYear,currentLunar.lunarMonth);
        document.getElementById('lunar-SD').selectedIndex=currentLunar.lunarDay - 1;
		//当前日期
		if(_this){
			_this.attr('class','date_item date_current');
		}
		
		//拉取黄历
		//getHL();
	};

    function resetDays(month){
        var days = getDaysOfMonth(month);

        var smd = document.getElementById("SD");
        smd.innerHTML = "";
        for(var i=1;i<=days;i++)
        {
            var ins = document.createElement("OPTION");
            ins.innerHTML = i;
            smd.appendChild(ins);
        }
    };

    /**
     * 判断农历年闰月数
     * @param {Number} year 农历年
     * return 闰月数 （月份从1开始）
     */
    function getLunarLeapYear(year){
        var yearData = lunarInfo[year-1890];
        return yearData[0];
    };

    //修改农历当年显示的月份，因为可能是闰年
	function resetLunarMonth(year){
        var leapMonth = getLunarLeapYear(year);
        if(leapMonth){
            //如果有闰年
            var smd = document.getElementById("lunar-SM");
            smd.innerHTML = "";

            var leapMonthCn = $.extend(true, [], monthCn);
            leapMonthCn.splice(leapMonth,0,'润'+monthCn[leapMonth-1]);
            for(var i=1;i<14;i++)
            {
                ins = document.createElement("OPTION");
                ins.innerHTML = leapMonthCn[i-1];
                smd.appendChild(ins);
            }

        }else{
            var smd = document.getElementById("lunar-SM");
            smd.innerHTML = "";
            for(var i=1;i<13;i++)
            {
                ins = document.createElement("OPTION");
                ins.innerHTML = monthCn[i-1];
                smd.appendChild(ins);
            }
        }
    };
    function resetLunarDays(year,month){
        var days = getLunarMonthDays(year)[month-1];
        console.log(days);
        var smd = document.getElementById("lunar-SD");
        smd.innerHTML = "";
        for(var i=1;i<=days;i++)
        {
            ins = document.createElement("OPTION");
            ins.innerHTML = lunarMonthDays[i-1];
            smd.appendChild(ins);
        }
    };

    function getLunarMonthDays(year){
        var yearData = lunarInfo[year-1890];
        var leapMonth = yearData[0]; //闰月
        var monthData = yearData[3].toString(2);
        var monthDataArr = monthData.split('');

        //还原数据至16位,少于16位的在前面插入0（二进制存储时前面的0被忽略）
        for(var i=0;i<16-monthDataArr.length;i++){
            monthDataArr.unshift(0);
        }

        var len = leapMonth ? 13 : 12; //该年有几个月
        var monthDays = [];
        for(var i=0;i<len;i++){
            if(monthDataArr[i]==0){
                monthDays.push(29);
            }else{
                monthDays.push(30);
            }
        }
        return  monthDays;
    };
	//恢复指定日期的状态信息
	function resetInfo(){
		//今天
		var oldObj = $('#date_list_'+panel[0]).find('.date_item').eq(current.pos);
		if(now.getFullYear()==current.year && now.getMonth()+1==current.month && now.getDate()==current.day){
			oldObj.attr('class','date_item date_today');
		}else{
			oldObj.attr('class','date_item');
		}
	};
	
	function showDate(){
		DATA = LunarCalendar.calendar(current.year,current.month,true);
        //设置是否显示补全日期
        var full = true;

        var dateHtml = '';
		var temp = itemTemp.join('');
		
		for(var i=0;i<DATA.monthData.length;i++){
			var itemData = DATA.monthData[i];
			
			if(i%7==0){ //某行第一列
				dateHtml+='<div class="date_row">'
			};
			
			var extendObj = {
				index : i,
				itemCls: '',
				iconCls: itemData.worktime ? (itemData.worktime==1 ? ' worktime' : ' holiday') : '',
				iconText: itemData.worktime ? (itemData.worktime==1 ? '班' : '休') : '',
				fetvCls: (itemData.lunarFestival || itemData.term) ? ' lunar_fetv' : (itemData.solarFestival ? ' solar_fetv' : ''),
				lunar: ''
			};
			
			var itemCls = '';
			if(now.getFullYear()==itemData.year && now.getMonth()+1==itemData.month && now.getDate()==itemData.day){
				itemCls = ' date_today';
			}
			if(current.year==itemData.year && current.month==itemData.month && current.day==itemData.day){ //当前选中
				itemCls = ' date_current';
				current.pos = i;
			}

			if(full && (i<DATA.firstDay || i>=DATA.firstDay+DATA.monthDays)){ //非本月日期
				itemCls = ' date_other';
			}
            if(!full && (i<DATA.firstDay || i>=DATA.firstDay+DATA.monthDays)){ //非本月日期
                itemCls = ' date_other full';
            }
			extendObj.itemCls = itemCls;
			
			var lunar = itemData.lunarDayName;
			//以下判断根据优先级
			if(itemData.solarFestival) lunar = itemData.solarFestival;
			if(itemData.lunarFestival) lunar = itemData.lunarFestival;
			if(itemData.term) lunar = itemData.term;
			extendObj.lunar = lunar;
			
			$.extend(itemData,extendObj);
			
			dateHtml += $.template(temp,itemData);
			
			if(i%7==6){//某行尾列
				dateHtml+='</div>';
			};
		};
		
		$('#date_list_'+panel[0]).html(dateHtml);


		showInfo();
	};
	
	//切换月份，可指定
	function pageDate(offset,_year,_month,_day){
		var year,month,day;
		if(_year && _month){ //直接指定
			year = _year;
			month = _month;
		}else{
			if(current.month+offset<1){ //上一年
				year = current.year-1;
				month = 12;
			}else if(current.month+offset>12){ //下一年
				year = current.year+1;
				month = 1;
			}else{
				year = current.year;
				month = current.month+offset;
			}
		}
		day = _day ? _day : (current.day > LunarCalendar.getSolarMonthDays[month-1] ? LunarCalendar.getSolarMonthDays[month-1] : current.day);
		if(year<minYear || year>maxYear)return; //超过范围

		setCurrentByNow(year,month,day);
		changePanel();
		showDate();
		
		slide(offset);
	};
	function changePanel(){
		var first = panel.shift();
		panel.push(first);
	};
	//滑动
	function slide(offset){
		timer && clearTimeout(timer);
		setSlidePos({time:0,pos:0});
		$('#date_list_'+panel[0]).css({left:offset * pageWidth}); //将要显示
		$('#date_list_'+panel[1]).css({left:0}); //当前显示
		
		if(offset>0){//左滑
			timer = setTimeout(function(){
				setSlidePos({time:300,pos:pageWidth * -1});
			},50);
		}else{ //右滑
			timer = setTimeout(function(){
				setSlidePos({time:300,pos:pageWidth});
			},50);
		}
	};
	function setSlidePos(opt){
		var slide = $('.date_slide')[0];
		slide.style.webkitTransitionDuration = opt.time+'ms';
		setTranslate(slide,opt.pos);
	};
	function setTranslate(obj,pos){
		if(mobile.platform=='iOS'){//iOS下启用3d加速，安卓下有BUG，使用2d
			obj.style.webkitTransform = 'translate3d('+pos+'px,0px,0px)';
		}else{
			obj.style.webkitTransform = 'translate('+pos+'px,0px)';
		}
	};
	
	function addEvent(){ //base hammer.js
		$('.date_list').hammer().on('tap','.date_item',function(){
			var index = $(this).attr('data-index');
			index = parseInt(index,10);
			var itemData = DATA.monthData[index];
			
			if(index<DATA.firstDay){ //上一个月
				pageDate(-1,itemData.year,itemData.month,itemData.day);
			}else if(index>=DATA.firstDay+DATA.monthDays){//下一个月
				pageDate(1,itemData.year,itemData.month,itemData.day);
			}else{
				resetInfo();
				setCurrentByNow(itemData.year,itemData.month,itemData.day,index);
				showInfo($(this));
			}
		});
		
		$('.today').hammer().on('tap',function(event){
			pageDate(1,now.getFullYear(),now.getMonth()+1,now.getDate());
			return false;
		});
		
		$('.slide_wrap').hammer().on('swipeleft',function(event){
			pageDate(1);
			event.preventDefault();
			event.gesture.preventDefault();
			return false;
		});
		
		$('.slide_wrap').hammer().on('swiperight',function(event){
			pageDate(-1);
			event.preventDefault();
			event.gesture.preventDefault();
			return false;
		});
        $('.changeSubmit').on("click", function () {
            if(!selectCalendarType){
                solarSubmit();
                $('.select-area').hide();
                $('.mask').hide();
            }else{
                lunarSubmit();
                $('.select-area').hide();
                $('.mask').hide();
            }
        });
        function solarSubmit(){
            console.log('change');
            var y,m;
            y = document.getElementById("SY").selectedIndex + 1900;
            m = document.getElementById("SM").selectedIndex+1;
            console.log(y,m);
            pageDate(-1,y,m);
        };

        function lunarSubmit(){
            console.log('change');
            var y,m;
            y = document.getElementById("lunar-SY").selectedIndex + 1899;
            m = document.getElementById("lunar-SM").selectedIndex+1;
            d = document.getElementById("lunar-SD").selectedIndex+1;
            //转成公历 肯呢有闰月 就是13个月
            var lunarDate = LunarCalendar.lunarToSolar(y,m,d);
            pageDate(-1,lunarDate.year,lunarDate.month,lunarDate.day);
        };
        $('.icon_calendar,.current-date').on('click', function () {
            var currentLunar = LunarCalendar.solarToLunar(current.year,current.month,current.day);
            //公历
            document.getElementById('SY').selectedIndex=current.year-1900;
            document.getElementById('SM').selectedIndex=current.month - 1;

            resetDays(current.month);
            document.getElementById('SD').selectedIndex=current.day - 1;

            //农历
            document.getElementById('lunar-SY').selectedIndex=currentLunar.lunarYear-1899;

            document.getElementById('lunar-SM').selectedIndex=currentLunar.lunarMonth - 1;

            document.getElementById('lunar-SD').selectedIndex=currentLunar.lunarDay - 1;

            var $selectArea = $('.select-area');
            $selectArea.show();
            $('.mask').show();
        });
        function changeToLunar() {
            selectCalendarType = 1;
            $('.lunar-select').show();
            $('.solar-select').hide();
            $('.changeCalendarType').html("公历");
        }
        function changeToSolar () {
            selectCalendarType = 0;
            $('.lunar-select').hide();
            $('.solar-select').show();
            $('.changeCalendarType').html("农历");
        }

        $('.cancelSubmit').on("click", function () {
            $('.select-area').hide();
            $('.mask').hide();

        });

        $('.changeCalendarType').on("click",function () {
            if(!selectCalendarType){
                changeToLunar();
            }else {
                changeToSolar();
            }
        })
	};
	
	function initPageElm(){
		pageWidth = $(document).width();
		$('.date_list').eq(0).css('width',pageWidth);
		$('.date_list').eq(1).css({'width':pageWidth,'left':pageWidth});
		if(mobile.platform=='iOS'){//iOS启用3d，同时将子元素也设置一下，防止BUG
			setTranslate(document.getElementById('date_list_0'),0);
			setTranslate(document.getElementById('date_list_1'),0);
		}
	};

    function fillSolarSelect() {
        var ins;
        var syd = document.getElementById("SY");
        syd.innerHTML = "";
        for(var i=1900;i<2050;i++)
        {
            ins = document.createElement("OPTION");
            ins.innerHTML = i;
            syd.appendChild(ins);
        }
        var smd = document.getElementById("SM");
        smd.innerHTML = "";
        for(var i=1;i<13;i++)
        {
            ins = document.createElement("OPTION");
            ins.innerHTML = i;
            smd.appendChild(ins);
        }
    }

    function fillLunarSelect() {
        var ins;
        var syd = document.getElementById("lunar-SY");
        syd.innerHTML = "";
        for(var i=1899;i<2050;i++)
        {
            ins = document.createElement("OPTION");
            ins.innerHTML = i;
            syd.appendChild(ins);
        }
    }
    function getDaysOfMonth(month){
        return  monthDays[month-1];
    }

    //打开页时,在下拉列表中显示当前年月,并调用自定义函数drawCld(),显示公历和农历的相关信息
    function initialSolar() {
        //用自定义变量保存当前系统中的年月日

        document.getElementById('SY').selectedIndex=tY-1900;
        document.getElementById('SM').selectedIndex=tM;
        document.getElementById('SM').selectedIndex=tD-1;
    }

    function swiperInit(){
        for (var i = 0; i < typeArr[0].length; i++) {
            if (!myScroll[typeArr[0][i]]) {
                initScroll(typeArr[0][i]);
            }
        }
    }
     function initScroll(type) {
        var self = this,
            $parent = $('.' + type + '-scroll');
        myScroll[type] = new Swiper(document.getElementById(type + '-scroll'), {
            initialSlide: $parent.find('.swiper-slide-active').index(),
            autoplay: false,
            loop: false,
            direction: "vertical",
            freeMode: false,
            freeModeMomentum: false,
            slideToClickedSlide: false,
            freeModeMomentumRatio: true,
            centeredSlides: true,
            watchSlidesProgress: true,
            watchSlidesVisibility: true,
            onTransitionEnd: function (swipe) {
                $current = $parent.find('.swiper-slide-active');

                var value = parseInt($current.attr('data-val'));
                if (type == 'year' || type == 'month' || type == 'date') {
                    if (data.latest[type] != value) {
                        data.latest[type] = value;
                        self.resetOption(type);
                    }
                } else {
                    data[type] = value;
                }
            }
        });
    }
    function init(){
		initPageElm();
		addEvent();
		setCurrentByNow();
        //公历
        fillSolarSelect();
        initialSolar();
        //农历
        fillLunarSelect();
        //initialLunar();
        showDate();
    };
	
	return {
		init : init
	};
})();

$(function(){
	Calendar.init();
});