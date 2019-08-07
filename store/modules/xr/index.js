import axios from 'axios';

import avatarModule from './modules/avatar';
import carouselModule from './modules/carousel';
import graphicsModule from './modules/graphics';
import mapModule from './modules/map';


export const modules = {
        avatar: avatarModule,
        carousel: carouselModule,
        graphics: graphicsModule,
        map: mapModule
};

export const state = function () {
    return {
        LSObjs: [],
        LSObjsLoaded: false,
        roomConfig: {},
        roomName: 'ls-room',
        rooms: [],
        sceneLoaded: false,
        isMobile: false,
        inVR: false
    }
};

export const getters = {
    numberOfLSObjs: state => {
        return state.LSObjs.length;
    },
    facetItems (state, getters, rootState, rootGetters) {
        var items = [];
        switch (rootState.facet) {
            case 'content':
                items = rootState.objects.content;
                break;
            case 'contacts':
                items = rootState.objects.contacts;
                break;
            case 'events':
                items = rootState.objects.events;
                break;
            default:
                break;
        }
        return items;
    },
    itemsLength(state, getters, rootState, rootGetters) {
        return getters.facetItems.length;
    },
};

export const mutations = {
        SET_IN_VR: function(state, active=true) {
            // if (CONFIG.DEBUG) {console.log("SET_IN_VR")}
            state.inVR = active;
        },
        SET_LSOBJS: function(state, objs) {
            // if (CONFIG.DEBUG) {console.log('SET_LSOBJS');}
            state.LSObjs = objs;
            state.LSObjsLoaded = true;
        },
        SET_ROOMS: function(state, rooms) {
            // if (CONFIG.DEBUG) {console.log('SET_ROOMS');}
            state.rooms = rooms;
        },
        SET_ROOMCONFIG: function(state, roomConfig) {
            // if (CONFIG.DEBUG) {console.log('SET_ROOMCONFIG');}
            state.roomConfig = roomConfig;
        },
        SET_ROOMNAME: function(state, name) {
            // if (CONFIG.DEBUG) {console.log('SET_ROOMNAME');}
            state.roomName = name;
        },
        SET_SCENELOADED: function(state) {
            // if (CONFIG.DEBUG) {console.log('SET_SCENELOADED');}
            if (AFRAME == undefined) {
                state.sceneLoaded = false;
            }
            else {
                var scene = AFRAME.scenes[0];
                state.sceneLoaded = scene == undefined ? false : scene.hasLoaded;
            }
        },
        SET_ISMOBILE: function(state) {
            // if (CONFIG.DEBUG) {console.log('SET_ISMOBILE');}
            if (AFRAME == undefined) {
                console.log("Cannto call SET_ISMOBILE before AFRAME is loaded");
            }
            else {
                state.isMobile = AFRAME.utils.device.isMobile();
            }
        },
};
export const actions = {
        setRoomName (context, name) {
            // if (CONFIG.DEBUG) {console.log(`setRoomName(${name})`);};
            context.commit('SET_ROOMNAME', name);
        },

        getRoomConfig ({ commit }) {
            // if (CONFIG.DEBUG) {console.log("getRoomConfig action");};
            return axios.get("/roomconfig")
            .then((res) => {
                commit('SET_ROOMCONFIG', res.data);
            })
        },

};

const xrModule = {
    namespaced: true,
    modules,
    state,
    getters,
    mutations,
    actions
};

export default xrModule;
