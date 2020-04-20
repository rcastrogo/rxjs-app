import {from, Subscriber, fromEvent} from 'rxjs';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {throttleTime} from 'rxjs/operators';
import {pluck} from 'rxjs/operators';
import {rc} from './lib/mapa'

window.onload = () => {

  let _date = new Date();

  function render(date) {
    var m_names   = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var m_names_s =  m_names.map( m => m.substr(0,3));
    var d_names   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ];
    var d_names_s = ['D', 'L', 'M', 'X', 'J', 'V', 'S' ];
    // ================================================================================================
    // Table
    // ================================================================================================
    let tb = (() => {
      let c = document.createElement('div');
      c.innerHTML = '<table class="c-table" width="100%" height="100%">' + 
                    '<thead><tr class="c-header">' + 
                    [1, 2, 3, 4, 5, 6, 0].map( i => '<td class="c-header">' + d_names_s[i] + '</td>') +
                    '</tr><thead>' +
                    '<tbody>' + 
                    [1, 2, 3, 4, 5, 6].map( i => '<tr>' + '<td></td>'.repeat(7) + '</tr>' ) +
                    '</tbody>' + 
                    '</table>';
      return c.firstElementChild;
    })();
    // ===========================================================================
    // Init
    // ===========================================================================
    let day0   = new Date(date.getFullYear(), date.getMonth(), 0); 
    let day1   = new Date(date.getFullYear(), date.getMonth(), 1); 
    let offset = 2 + day0.getDate() - (day1.getDay() || 7);  
    let cells  = Array.from(tb.querySelectorAll('tbody td'))
                      .map( (cell, i) => {
                        cell._date = new Date(day0.getFullYear(), 
                                             day0.getMonth(),
                                             offset + i);
                        cell._day    = cell._date.getDate();
                        cell._active = cell._date.getMonth() === day1.getMonth();
                        cell.id      = 'day/{0}'.format(cell._date.format());                      
                        return cell;
                      })
                      .map( cell => {
                        cell.className = cell._active ? 'c-day' : 'c-day-disabled'; 
                        if(cell._active){
                          cell.appendChild(document.createTextNode('{0}'.format(cell._day)));
                        }else{
                          cell.appendChild(document.createTextNode('{1}/{0}'.format( 
                                                        m_names_s[cell._date.getMonth()],
                                                        cell._day)));
                        }
                        let div = document.createElement('div');
                        div.className = 'c-day-container';
                        cell.appendChild(div);
                        return cell;
                      });
    // ===========================================================================
    // Remove last row if empty
    // ===========================================================================
    if (!cells.slice(-7).some(c => c._active)) tb.deleteRow(-1);
    //let FirstDate = new Date(day0.getFullYear(), day0.getMonth(), offset);    
    //let LastDate = new Date(day0.getFullYear(), day0.getMonth(), offset + 41);
    return tb;
  }
  
  document.body.appendChild(render(_date));

  document.onkeyup = function (event) {
      document.body.innerHTML = '';
    if (event.key === '+') {
      _date.setMonth(_date.getMonth() + 1);
      document.body.appendChild(render(_date))
    }
    if (event.key === '-') {
      _date.setMonth(_date.getMonth() - 1);
      document.body.appendChild(render(_date))
    }
  }
  
};