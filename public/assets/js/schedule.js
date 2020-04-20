﻿(function(){

  window.Schedule = function(o){

    var $ = {
      $ : function(element, o) {
        var x = element === 'text' ? document.createTextNode(o) : document.createElement(element);  
        for (var p in o) {
          if ( x[p] && typeof x[p] === 'object')
            for (var p2 in o[p]) x[p][p2] = o[p][p2];
          else
            x[p] = o[p];
        }
        return x;
      }
    }

    var _that = { Min            : o.Min || 0, 
                  Max            : o.Max || 24 * 60,
                  Step           : 180,
                  Date           : o.Date || new Date(),
                  OnMonthChanged : o.OnMonthChanged,
                  OnDayChanged   : o.OnDayChanged,
                  OnViewChanged  : o.OnViewChanged
                }; 
    var MonthsNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var DaysNames   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ];
    var DaysNames2   = ['D', 'L', 'M', 'X', 'J', 'V', 'S' ];
    var DaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // =============================================================================================  
    // Events
    // =============================================================================================
    var __raiseMonthChanged = function() { if (_that.OnMonthChanged) _that.OnMonthChanged(_that, _that.Date); };
    var __raiseDayChanged   = function() { if (_that.OnDayChanged) _that.OnDayChanged(_that, _that.Date); };
    var __raiseViewChanged  = function() { if (_that.OnViewChanged) _that.OnViewChanged(_that, __currentView); };
    // =============================================================================================
    // Private stuff
    // ============================================================================================= 
    var __currentView;
                  
    var __syncLabelText = function(){
      _that.Buttons.Label.innerHTML = function(){
        if(__currentView=='Month') return '{0} de {1}'.format(MonthsNames[_that.Date.getMonth()], _that.Date.getFullYear());
        if(__currentView=='Day') return '{0}, {1} de {2} de {3}'.format(DaysNames[_that.Date.getDay()], 
                                                                        _that.Date.getDate(),
                                                                        MonthsNames[_that.Date.getMonth()], 
                                                                        _that.Date.getFullYear()); 
        if(__currentView=='Agenda')  return '{0}, {1} de {2} de {3}'.format(DaysNames[_that.Date.getDay()], 
                                                                        _that.Date.getDate(),
                                                                        MonthsNames[_that.Date.getMonth()], 
                                                                        _that.Date.getFullYear()); 
      }();
    }
          
    var __toogle = function(t){
      if(__currentView==t) return;
      __currentView = t;
      _that.Containers.Month.style.display = 'none';
      _that.Containers.Day.style.display = 'none';
      _that.Containers.Agenda.style.display = 'none';
      _that.Containers[t].style.display = '';
      _that.Buttons.Month.style.borderBottom = __currentView=='Month' ? 'solid 2px #ccc' : '';
      _that.Buttons.Day.style.borderBottom = __currentView=='Day' ? 'solid 2px #ccc' : ''
      _that.Buttons.Agenda.style.borderBottom = __currentView=='Agenda' ? 'solid 2px #ccc' : '';   
      __syncLabelText();
      __raiseViewChanged();
    }

    _that.ShowDayView = function(date){
      var __currentMonth = _that.Date.getMonth();
      _that.Date = new Date(date.split('/')[2], date.split('/')[1]-1 , date.split('/')[0]);
      if(__currentMonth!=_that.Date.getMonth()){
        __renderCaledarView();
        __raiseMonthChanged();
      }else{
        __raiseDayChanged();
      }        
      _that.Buttons.Day.click(); 
      __syncLabelText();   
    }

    var __Handle = function(eventName){
      switch (eventName){
        case 'Previous':
          if(__currentView=='Month'){          
            _that.Date.setMonth(_that.Date.getMonth() - 1);
            __renderCaledarView();
            __raiseMonthChanged();
          }else{
            var __currentMonth = _that.Date.getMonth();
            _that.Date.setDate(_that.Date.getDate() - 1);
            if(__currentMonth!=_that.Date.getMonth()){
              __renderCaledarView();
              __raiseMonthChanged();
            }
            else __raiseDayChanged();
          } 
          __syncLabelText();        
          break;
        case 'Next':
          if(__currentView=='Month'){          
            _that.Date.setMonth(_that.Date.getMonth() + 1);
            __renderCaledarView();
            __raiseMonthChanged();
          }else{
            var __currentMonth = _that.Date.getMonth();
            _that.Date.setDate(_that.Date.getDate() + 1);
            if(__currentMonth!=_that.Date.getMonth()){
              __renderCaledarView();
              __raiseMonthChanged();
            }
            else __raiseDayChanged();
          }
          __syncLabelText(); 
          break        
      }    
    } 
  
    var __init = function(){   
      __toogle(o.View || 'Day');
      __initDayView();
      __renderCaledarView();
      __syncLabelText();
      __raiseMonthChanged();
    }
  
    var __getRange        = function()      { return _that.Max - _that.Min ; } 
    var __screenToControl = function(value, control) { return _that.Min + ((value / control.clientWidth * 100) / 100 * __getRange()); }      
    var __rangeToScreen = function(value) { return (value - _that.Min) * 100 / __getRange(); }
    var __minutesToString = function(minutes,cero){
      return '{0}:{1}'.format( String.leftPad(Math.floor(minutes/60), cero ? 2 : 1,'0'), 
                               String.leftPad(Math.ceil(minutes%60),2,'0'));
    }
  
    var __stepValue = function(value, step){
      if(value<_that.Min) value = _that.Min;
      if(value>_that.Max) value = _that.Max;
      var __rest = value%step         
      if(__rest>_that.Step/2){      
        value = Math.ceil(value/step) * step;      
      }else{ 
        if(_that.Max-__rest<value){
          value=_that.Max;
        }else{
          value = Math.floor(value/step) * step;
        }     
      } 
      return value;
    }
      
  
    var __renderCaledarView = function(){
    
      var month = _that.Date.getMonth() ;
      var year  = _that.Date.getFullYear() ;    
    
      if(_that.Containers.Month.Table) _that.Containers.Month.removeChild(_that.Containers.Month.Table);
      var __table = _that.Containers.Month.Table = $.$('table', { className : 'Cal' });    
      __table.__Body = document.createElement("tbody");
      __table.__Header = $.$('tr', { className : 'Cal_header' });
      [1,2,3,4,5,6,0].forEach( function(v){
        var __cell = $.$('td', { className : 'Cal_header' });
        __cell.appendChild(document.createTextNode('{0}'.format( DaysNames2[v]) ));
        __table.__Header.appendChild(__cell);
      });
      __table.__Body.appendChild(__table.__Header);
      __table.__Cells = [];
   
      var monthLength = DaysInMonth[month];
      if ((month == 1) && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)) monthLength = 29;    
      var startingDay = new Date(year, month, 1).getDay();
      startingDay = (startingDay == 0) ? 7 : startingDay;

      var day = 1;
      var dayA = new Date(year, month, 0).getDate(); 
      _that.FirstDate = new Date(year, month, 0);  
      var day2 = 1;
      dayA = ++dayA - startingDay;      
      _that.FirstDate = new Date(_that.FirstDate.getFullYear(), _that.FirstDate.getMonth(), dayA+1);            
      _that.LastDate = new Date(_that.FirstDate.getFullYear(), _that.FirstDate.getMonth(), dayA+42); 

      for (var i = 0; i < 6; i++) {
        var __Row = document.createElement("tr");      
        for (var j = 1; j <= 7; j++) {
          var __Cell = document.createElement("td");         
          if (day <= monthLength && (i > 0 || j >= startingDay)) {
            __Cell.Date = new Date(year, month, day);
            __Cell.id = 'day_{0}'.format(__Cell.Date.format());      
            __Cell.className = "Cal_Day";          
            __Cell.appendChild(document.createTextNode('{0}'.format(day++)));
            var __div = $.$('div', { className : 'Cal_day_con' })
            __Cell.appendChild(__div);
            __Row.__append = true;          
          }
          else {
            if(day >= monthLength){
              __Cell.Date = new Date(_that.LastDate.getFullYear(), month + 1, day2);
            }else{
              __Cell.Date = new Date(_that.FirstDate.getFullYear(), _that.FirstDate.getMonth(), dayA+1);
            }          
            __Cell.id = 'day_{0}'.format(__Cell.Date.format());
            __Cell.className = "Cal_Day_Disabled";          
            __Cell.appendChild(document.createTextNode('{1}/{0}'.format( 
                                                      MonthsNames[__Cell.Date.getMonth()].substr(0,3) ,
                                                      (day >= monthLength) ? day2++ : ++dayA)));
            var __div = $.$('div', { className : 'Cal_day_con' })                                                                                            
            __Cell.appendChild(__div); 
          } 
          __table.__Cells.add(__Cell);
          __Row.appendChild(__Cell);
        }
       if (__Row.__append) __table.__Body.appendChild(__Row);
      }            
      __table.appendChild(__table.__Body);                       
      _that.Containers.Month.appendChild(__table);     
    }   
  
    var __initDayView = function(){     
      _that.Containers.Day.Overlay0.innerHTML = '';
      for(var i=0; i<=(__getRange()/_that.Step); i++){
        var __minutes = _that.Min + (i*_that.Step);             
        var __vline = $.$('div', { className : 'vline'});
        var __label_top = $.$('div', { className : 'label_top', innerHTML : __minutesToString(__minutes,true) });
        var __label_bottom = $.$('div', { className : 'label_bottom', innerHTML : __minutesToString(__minutes,true) });         
        var __left = __rangeToScreen(__minutes);         
        __vline.style.left = '{0}%'.format(__left);
        __label_top.style.left = '{0}%'.format(__left);
        __label_bottom.style.left = '{0}%'.format(__left);
        if (!(__minutes==_that.Min || __minutes==_that.Max)) _that.Containers.Day.Overlay0.appendChild(__vline);      
        if(__minutes%60==0) {
          if(__minutes%120!=0){
            __label_top.className = 'label_top impar';
            __label_bottom.className = 'label_bottom impar';
          }
          __vline.style.backgroundColor = 'black';
          _that.Containers.Day.Overlay0.appendChild(__label_top);
          _that.Containers.Day.Overlay0.appendChild(__label_bottom);
        } else if (__minutes%30==0){
          __vline.style.backgroundColor = 'silver';
        }         
      }           
    }
    // =============================================================================================
    // Public methods
    // =============================================================================================
    _that.ClearMonthView  = function() { _that.Containers.Month.Table.__Cells.forEach( function(c){ c.childNodes[1].innerHTML = '';});}; 
    _that.ClearDayView    = function() { _that.Containers.Day.Overlay1.innerHTML = ''; };
    _that.ClearAgendaView = function() { _that.Containers.Agenda.Overlay0.innerHTML = ''; };

    _that.ConfigureView = function(o) {
      _that.Min   = o.min;
      _that.Max   = o.max;      
      _that.Step  = o.step;
      __initDayView();
    }
  
    _that.LoadMonthView = function(childNodes){                   
      Object.keys( childNodes || {})
          .forEach( function(item){      
        var __Cell = _that.Containers.Month.Table.__Cells.item('id', 'day_{0}'.format(item));  
        if(__Cell){
          childNodes[item].forEach( function(element){
            __Cell.childNodes[1].appendChild(element);  
          });
        }
      });    
    }
     
    _that.LoadDayView = function(childNodes){      
      (childNodes||[]).forEach( function(child){
        _that.Containers.Day.Overlay1.appendChild(child);
      });    
    }
  
    _that.LoadAgendaView = function(childNodes, callback){               
      (childNodes||[]).forEach( function(child){
        _that.Containers.Agenda.Overlay0.appendChild(child);
      }); 
      if(callback){
        setTimeout(function(){ callback(_that.Containers.Agenda.Overlay0); }, 100);
      }
    }
  
    _that.MeasureDayItem = function(value){
      return { left  : '{0}%'.format(__rangeToScreen(value.start)) , 
               width : '{0}%'.format((value.end - value.start)*100/__getRange()) };
    }
  
    _that.Utils = { 
      GetRange        : __getRange,
      ScreenToControl : __screenToControl,
      RangeToScreen   : __rangeToScreen,
      MinutesToString : __minutesToString,
      FixValue        : __stepValue
    } 
  
    // =====================================================================
    // Control creation
    // =====================================================================                    
    _that.Container = o.Element;
    _that.Container.onselectstart = function(){ return false; };  
    // Buttons      
    _that.Buttons = { 'Agenda': $.$('button', { className : 'pol-btn w3-button w3-black w3-right',
                                                type      : 'button', 
                                                innerHTML : 'A', 
                                                onclick   : function() { __toogle('Agenda'); } }),
                      'Day'   : $.$('button', { className : 'pol-btn w3-button w3-black w3-right',
                                                type      : 'button', 
                                                innerHTML : 'D', 
                                                onclick   : function() { __toogle('Day'); } }),
                      'Month' : $.$('button', { className : 'pol-btn w3-button w3-black w3-right', 
                                                type      : 'button',  
                                                innerHTML : 'M',                                                 
                                                onclick   : function() { __toogle('Month'); } }),
                      'Previous' : $.$('button', { className : 'w3-button w3-white w3-left', 
                                                   type  : 'button',
                                                   style : { padding : '4px 6px' },
                                                   innerHTML : '<i class="fa fa fa-chevron-left"></i>',                                                 
                                                   onclick   : function() { __Handle('Previous'); } }),
                      'Label': $.$('div',   { className : 'ScheduleLabel' }),                                                  
                      'Next' : $.$('button', { className : 'w3-button w3-white w3-right', 
                                               type      : 'button',
                                               style     : { padding : '4px 6px' },  
                                               innerHTML     : '<i class="fa fa fa-chevron-right"></i>',                                                 
                                               onclick   : function() { __Handle('Next'); } })                                               
                    };
    // Containers                                                    
    _that.Containers = {  'Agenda': $.$('div', { className : 'ScheduleContainer',
                                                 style     : { left : '0', right : '0', top: '0', bottom : '10' }                                                                                           
                                               }),
                          'Day'   : $.$('div', { className : 'ScheduleContainer'
                                               }),
                          'Month' : $.$('div', { className : 'ScheduleContainer',                                               
                                                 style     : { left : '0', right : '0', top: '0', bottom : '0' }
                                               })
                        };
    // Day                    
    _that.Containers.Day.Overlay0 = $.$('div', { className   : 'ScheduleOverlay_0'});
    _that.Containers.Day.Overlay1 = $.$('div', { className   : 'ScheduleOverlay_1', 
                                                 onmousemove :   function(e){
                                                   //var __offset = MAPA.ContextMenu.prototype.GetElementPosition(_that.Containers.Day.Overlay1);
                                                   //var __MP = _that.Containers.Day.MousePosition = {};
                                                   //__MP.X = e.target.clientX - __offset.X;
                                                   //__MP.Y = e.target.clientY - __offset.Y;                                                
                                                   //__MP.PercentX = (__MP.X  / _that.Containers.Day.Overlay1.clientWidth)*100;
                                                   //__MP.PercentY = (__MP.Y  / _that.Containers.Day.Overlay1.clientHeight)*100;
                                                   //__MP.ValueX = __screenToControl(__MP.X, _that.Containers.Day.Overlay1);
                                                   //__MP.FixedValueX  = __stepValue(__MP.ValueX, 5);                                                                                                                                                                                                                                                                    
                                                   //if(_that.Containers.Day.OnMouseMove) _that.Containers.Day.OnMouseMove(_that, __MP);                                                                                                                                                
                                                 }      
                                               });
   
    _that.Containers.Day.appendChild(_that.Containers.Day.Overlay0);
    _that.Containers.Day.appendChild(_that.Containers.Day.Overlay1);    
    // Agenda
    _that.Containers.Agenda.Overlay0 = $.$('div', { className : 'ScheduleOverlay_0', 
                                                    style     : { left : '0', right : '0', overflow : 'auto'} });
    _that.Containers.Agenda.appendChild(_that.Containers.Agenda.Overlay0); 
    // Header
    _that.Header = $.$('div', { className : 'ScheduleHeader',  id : '{0}_schedule_header'.format(o.Element.id) });                                         
    _that.Header.appendChild(_that.Buttons.Previous);
    _that.Header.appendChild(_that.Buttons.Label);
    _that.Header.appendChild(_that.Buttons.Next);   
                                       
    _that.Header.appendChild(_that.Buttons.Day);
    _that.Header.appendChild(_that.Buttons.Agenda);  
    _that.Header.appendChild(_that.Buttons.Month);
    // Body 
    _that.Body = $.$('div', { className : 'ScheduleBody',    id : '{0}_schedule_body'.format(o.Element.id) });                           
    _that.Body.appendChild(_that.Containers.Day); 
    _that.Body.appendChild(_that.Containers.Agenda);  
    _that.Body.appendChild(_that.Containers.Month);   
    // Footer                           
    _that.Footer = $.$('div', { className : 'ScheduleFooter',  id : '{0}_schedule_footer'.format(o.Element.id) }); 
    // Control
    _that.Control   = $.$('div', { className : 'Schedule',     id : '{0}_schedule'.format(o.Element.id) });                                                                                    
    _that.Control.appendChild(_that.Header);
    _that.Control.appendChild(_that.Body);
    _that.Control.appendChild(_that.Footer);        
    _that.Container.appendChild(_that.Control);         
    __init( _that.Date );          
    return _that;     
  }

})();

