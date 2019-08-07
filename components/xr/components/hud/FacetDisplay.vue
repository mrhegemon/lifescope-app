<template>
    <div class="facet-display" :class="{ 'desktop-hud': !isMobile, 'mobile-hud': isMobile }">
          <div class="current-facet">
              {{ $store.state.facet }}
            </div>
            <div class="facet-links">
                <div v-for="(facet, index) in facets" :key="index">
                    <a v-on:click="setFacet(facet)"> {{facet}} </a>
                </div>
            </div>
      </div>
</template>

<script>

import { mapState } from 'vuex';

export default {
    data() {
        return {
            facets: [
                'content',
                'events',
                'contacts'
            ]
        }
    },

    computed: {
        ...mapState('xr',
        [
            'isMobile',
        ])
    },
    methods: {
        setFacet: function(facet) {
            this.$root.$emit('set-facet', facet)
        },
    },
}
</script>

<style src="./FacetDisplay.css"></style>
