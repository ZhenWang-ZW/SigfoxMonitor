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
  maxDate = new Date(new Date().setHours(0,0,0,0));
  chartOptions:any;
  
  tempChartOpts:any;
  humChartOpts:any;
  presChartOpts:any;
  gasChartOpts:any;

  private dayBegin:string = (new Date().setHours(0,0,0,0)).toString(); //ms of dayBegin
  private dayEnd:string = (new Date().setHours(23,59,59,999)).toString();;  //ms of dayEnd
  private latestDbTimestamp:string =(new Date().getTime()).toString();

  
  private datePipe = new DatePipe("en-IE");
  private tempData = [];
  private humData = [];
  private presData = [];
  private gasData = [];

  private xDateTime = [];
  private latest = (new Date().setHours(0,0,0,0)).toString();

  private maxShow = 60;
  private count = 0;

  private timer;

  ngOnInit() {
    this.defaultChartOpts();
    
      let updateChart = this.getData();
      
      updateChart();
      this.timer = setInterval(function(){
          updateChart();
      }.bind(this),5000);
  }

  getData(){
    return function(){
    var current = (new Date().getTime()).toString();

    const URL = "/default/getSigfoxDataByDate";//?from=%22"+this.dayBegin+"%22&to=%22"+this.dayEnd+"%22";
    let params = new HttpParams();
    params = params.append('from', "\""+this.latest+"\"");//1551312000000 this.dayBegin latest
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
              
              if(this.count>=this.maxShow){
                this.tempData.shift();
                this.humData.shift();
                this.presData.shift();
                this.gasData.shift();
                this.xDateTime.shift();
              }
              this.tempData.push(temp);
              this.humData.push(hum);
              this.presData.push(pres);
              this.gasData.push(gas);
              this.xDateTime.push(this.datePipe.transform(new Date(timestamp), 'HH:mm:ss'));
              this.latest = (timestamp+1).toString();
              this.count++;
              this.setChartOpts(this.tempData, this.humData, this.presData, this.gasData, this.xDateTime);
              console.log("new data @: "+ aItem.timestamp);
              
          }.bind(this));

      })
      .catch(err=>{console.log(err);});
    }.bind(this);
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
  

  dateChange(val){
    if(val.getTime() != this.maxDate.getTime()){
      let sDateBegin = val.getTime();
      let sDateEnd = val.setHours(23,59,59,999);
      
      if(this.timer){clearInterval(this.timer);}
      
      this.getDataBetween(sDateBegin, sDateEnd);
    }else{
      
      this.setChartOpts(this.tempData, this.humData, this.presData, this.gasData, this.xDateTime);

      let updateChart = this.getData();
      
      updateChart();
      this.timer = setInterval(function(){
          updateChart();
      }.bind(this),5000);
    }
  }

  getDataBetween(start, end){
    
    let maxShow = 120;
    let count = 0;
    let tempData = [];
    let humData = [];
    let presData = [];
    let gasData = [];

    let xDateTime = [];

    const URL = "/default/getSigfoxDataByDate";//?from=%22"+this.dayBegin+"%22&to=%22"+this.dayEnd+"%22";
    let params = new HttpParams();
    params = params.append('from', "\""+start+"\"");//1551312000000 this.dayBegin latest
    params = params.append('to', "\""+end+"\"");//1551398399999 this.dayEnd current

    this.http.get(URL, {params: params})
      .toPromise()
      .then(response => {
          var dataJSON = JSON.parse(JSON.stringify(response));
          let bodyJSON = JSON.parse(dataJSON.body);
          let ItemsArray = bodyJSON.Items;
          console.log("found: "+bodyJSON.Count);
          if(bodyJSON.Count==0){
            this.defaultChartOpts();
          }
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
              xDateTime.push(this.datePipe.transform(new Date(timestamp), 'HH:mm:ss'));
              
              count++;
              this.setChartOpts(tempData, humData, presData, gasData, xDateTime);
              console.log("new data @: "+ aItem.timestamp);
          }.bind(this));

      })
      .catch(err=>{console.log(err);});
  }

}
