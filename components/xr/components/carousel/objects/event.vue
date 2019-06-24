<template>
	<a-entity class="object event feed" v-bind:id="event.id">
		
		<a-diorama-object
			facet='event'
			:type="event.type"
			:context="event.context"
			:provider="event.connection.provider.name"
			:connectionname="event.connection.name"
			:providericon="providerIonicon"
			:eventicon="eventTypeIonicon"
			:datetime="event.datetime"
			/>
	</a-entity>
</template>

<script>
import Math from 'math';

import moment from 'moment';

import icons from '../../../../../lib/util/icons';
import FAIonicon from '../../aframe/font-awesome-ionicons';

import UserContent from './content-child';
import UserContact from './contact-child';

export default {
	data () {
        return {
			size: 1,
			iconSize: 0.25
        }
	},
	
	components: {
		UserContent,
		UserContact
	},

	props: ['event'],

	computed: {
		eventTypeIonicon: function() {
			var icon = icons('event', this.event.type);
			var regex=/fa\-[a-zA-Z\-]+/i;
			return FAIonicon[icon.match(regex)[0]];
		},
		providerIonicon: function() {
			var icon = icons('provider', this.event.connection.provider.name);
			var regex=/fa\-[a-zA-Z\-]+/i;
			return FAIonicon[icon.match(regex)[0]];
		},
    },
  }
</script>
