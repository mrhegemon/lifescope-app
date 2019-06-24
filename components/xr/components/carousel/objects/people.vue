<template>
	<a-entity class="object people" v-bind:id="people.id">

		<a-diorama-object
			facet='people'
			:avatarurl='person.avatar_url'
			:contactname='person.name'
			:contacthandle='person.handle'
			/>
	</a-entity>
</template>

<script>
import icons from '../../../../../lib/util/icons';
import FAIonicon from '../../aframe/font-awesome-ionicons';

export default {
	data () {
        return {
			size: 1,
			iconSize: 0.25,
        }
	},

	props: ['person'],
  }
</script>
