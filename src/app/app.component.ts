import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatGridList } from '@angular/material';
import { HttpClient, HttpParams } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('grid') grid: MatGridList;
  constructor(private http: HttpClient){}
  title = 'SigfoxMonitor';

  chartOptions:any;
  
  tempChartOpts:any;
  humChartOpts:any;
  presChartOpts:any;
  gasChartOpts:any;

  private dayBegin:string = (new Date().setHours(0,0,0,0)).toString(); //ms of dayBegin
  private dayEnd:string = (new Date().setHours(23,59,59,999)).toString();;  //ms of dayEnd
  private latestDbTimestamp:string =(new Date().getTime()).toString();

  ngOnInit() {
    this.defaultChartOpts();
    let datePipe = new DatePipe("en-IE");
    let tempData = [];
    let humData = [];
    let presData = [];
    let gasData = [];

    let xDateTime = [];
    var latest = (new Date().setHours(0,0,0,0)).toString();

    let maxShow = 60;
    let count = 0;
    let updateChart = function(){

      var current = (new Date().getTime()).toString();

      const URL = "/default/getSigfoxDataByDate";//?from=%22"+this.dayBegin+"%22&to=%22"+this.dayEnd+"%22";
      let params = new HttpParams();
      params = params.append('from', "\""+latest+"\"");//1551312000000 this.dayBegin latest
      params = params.append('to', "\""+current+"\"");//1551398399999 this.dayEnd current

      this.http.get(URL, {params: params})
          .toPromise()
          .then(response => {
              var dataJSON = JSON.parse(JSON.stringify(response));
              let bodyJSON = JSON.parse(dataJSON.body);
              let ItemsArray = bodyJSON.Items;
              console.log("found: "+bodyJSON.Count);
              ItemsArray.forEach(function (aItem) {
                  let temp = parseInt(aItem.payload.temp,10)/10;
                  let hum = parseInt(aItem.payload.hum,10)/10;
                  let pres = parseInt(aItem.payload.pres,10)/10;
                  let gas = parseInt(aItem.payload.gas,10)/10;
                  let timestamp = parseInt(aItem.timestamp,10);
                  
                  if(count>=maxShow){
                    tempData.shift();
                    humData.shift();
                    presData.shift();
                    gasData.shift();
                    xDateTime.shift();
                  }
                  tempData.push(temp);
                  humData.push(hum);
                  presData.push(pres);
                  gasData.push(gas);
                  xDateTime.push(datePipe.transform(new Date(timestamp), 'HH:mm:ss'));
                  latest = (timestamp+1).toString();
                  count++;
                  this.setChartOpts(tempData, humData, presData, gasData, xDateTime);
                  console.log("new data @: "+ aItem.timestamp);
                  
              }.bind(this));

          })
          .catch(err=>{console.log(err);});
      }.bind(this);

      
      updateChart();
      let timer = setInterval(function(){
          updateChart();
      }.bind(this),5000);


  }

  setChartOpts(tempData, humData, presData, gasData, timeData){
    this.tempChartOpts = {
      title: { text: 'Temperature(°C)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: timeData },
      yAxis: {         },
      series: [{ name: 'Temperature °C ', type: 'line', data: tempData }]
    };

    this.humChartOpts = {
      title: { text: 'Humidity(%)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: timeData },
      yAxis: {         },
      series: [{ name: 'Humidity % ', type: 'line', data: humData }]
    };

    this.presChartOpts = {
      title: { text: 'Presure(hPa)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: timeData },
      yAxis: {         },
      series: [{ name: 'Presure (hPa) ', type: 'line', data: presData }]
    };

    this.gasChartOpts = {
      title: { text: 'Gas(KOhms)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: timeData },
      yAxis: {         },
      series: [{ name: 'Gas (KOhms) ', type: 'line', data: gasData }]
    };
  }

  defaultChartOpts(){
    this.tempChartOpts = {
      title: { text: 'Temperature (°C)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: [] },
      yAxis: {         },
      series: [{ name: 'Temperature(°C)', type: 'line', data: [] }]
    };

    this.humChartOpts = {
      title: { text: 'Humidity(%)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: [] },
      yAxis: {         },
      series: [{ name: 'Humidity(%) ', type: 'line', data: [] }]
    };

    this.presChartOpts = {
      title: { text: 'Presure(hPa)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: [] },
      yAxis: {         },
      series: [{ name: 'Presure (hPa) ', type: 'line', data: [] }]
    };

    this.gasChartOpts = {
      title: { text: 'Gas(KOhms)' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow'} }, 
      xAxis: {  data: [] },
      yAxis: {         },
      series: [{ name: 'Gas (KOhms) ', type: 'line', data: [] }]
    };
  }
  

}
