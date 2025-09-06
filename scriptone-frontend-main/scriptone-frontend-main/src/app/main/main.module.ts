import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { GlobalEarthComponent } from './shared/global-earth/global-earth.component';
import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [
    MainComponent,
    NavbarComponent,
    HomeComponent,
    GlobalEarthComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ]
})
export class MainModule { }
