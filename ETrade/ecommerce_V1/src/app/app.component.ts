import { Component, OnInit  }  from '@angular/core';

declare var $:any;
declare function HOMEINITTEMPLATE([]):any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
 } )
export class AppComponent implements OnInit{
  title = 'ecommerce';
  ngOnInit(): void {
    setTimeout(() => {
      HOMEINITTEMPLATE($);
     } , 50);
   } 
 } 
