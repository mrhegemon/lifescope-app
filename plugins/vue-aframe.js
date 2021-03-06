import Vue from 'vue';

import * as THREE from 'three';
import 'aframe';
import 'networked-aframe';
import 'aframe-extras';
import 'aframe-font-awesome';
import 'aframe-geojson-component';
import 'aframe-gui';
import 'aframe-input-mapping-component';
import 'aframe-super-keyboard';
import 'aframe-sun-sky';
import 'aframe-teleport-controls';

import 'nipplejs';
import 'particles.js';
import WebFont from 'webfontloader';

window.WebFont = WebFont;

import { xrPlugin, xrPluginStore } from 'lifescope-xr';

Vue.use(xrPlugin);

const ICE_SERVERS = Object.keys(CONFIG.iceServers).map(x => CONFIG.iceServers[x]);
NAF.adapters.setIceServers(ICE_SERVERS);


export default xrPluginStore;