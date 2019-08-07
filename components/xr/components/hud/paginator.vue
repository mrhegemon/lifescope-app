<template>
    <div class="paginator" :class="{ 'desktop-menu': !isMobile, 'mobile-menu': isMobile }">
        <div class="pageLeft" @click="pageLeft">
        </div>
        <div class="paginatorFill">
            {{pageStart}}-{{lastItemIndex}} / {{itemsLength}}
        </div>
        <div class="pageRight" @click="pageRight">
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {

    computed: {
        ...mapState('xr',
        [
            'isMobile',
        ]),
        ...mapGetters('xr',
        [
            'itemsLength'
        ]),
        ...mapState('xr/carousel',
        [
            'pageStart',
            'numberOfSegments'
        ]),
        lastItemIndex() {
            return Math.min(this.pageStart + this.numberOfSegments, this.itemsLength);
        }
    },

    methods: {
        pageLeft() {
            // if(CONFIG.DEBUG) {console.log("hud pageLeft");}
            this.$store.dispatch('xr/carousel/pageLeft');
        },
        pageRight() {
            // if(CONFIG.DEBUG) {console.log("hud pageRight");}
            this.$store.dispatch('xr/carousel/pageRight', {
                length: this.itemsLength
            });
        }
    },
}
</script>

<style src="./paginator.css"></style>
