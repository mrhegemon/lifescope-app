<template>
    <a-entity class="gallery-carousel">
        <a-rail v-for="n in numberOfSegments"
            :key="'railSegment' + n"
            :rotation="railRotation(n-1)"
            :position="railPosition(n-1)"
            :bump="bump"
            :normal="normal"/>
        <a-entity v-if="$store.state.objects.content.length > 0 ||
                            $store.state.objects.contacts.length > 0 ||
                            $store.state.objects.events.length > 0 ">
            <a-entity v-if="$store.state.facet === 'contacts'">
                <user-contact
                    v-for="(contact, index) in itemsCurrent"
                    :key="contact.id"
                    :contact="contact"
                    :connection="contact.connection"
                    :rotation="dioramaRotation(index)"
                    :position="dioramaPosition(index)">
                </user-contact>
            </a-entity>
            <a-entity  v-if="$store.state.facet === 'content'">
                <user-content
                    v-for="(content, index) in itemsCurrent"
                    :key="content.id"
                    :content="content"
                    :connection="content.connection"
                    :rotation="dioramaRotation(index)"
                    :position="dioramaPosition(index)">
                </user-content>
            </a-entity>
            <a-entity v-if="$store.state.facet === 'events'">
                <user-event 
                    v-for="(event, index) in itemsCurrent"
                    :key="event.id"
                    :event="event"
                    :rotation="dioramaRotation(index)"
                    :position="dioramaPosition(index)">
                </user-event>
            </a-entity>
            <a-entity v-if="$store.state.facet === 'people'">
                <user-person
                    v-for="person in $store.state.objects.people"
                    v-bind:key="person.id"
                    v-bind:person="person"
                    :rotation="dioramaRotation(index)"
                    :position="dioramaPosition(index)">
                </user-person>
            </a-entity>
        </a-entity>
    </a-entity>
</template>

<script>
import { mapState } from 'vuex';

import UserContact from './objects/contact.vue';
import UserContent from './objects/content.vue';
import UserEvent from './objects/event.vue';
import UserPerson from './objects/people.vue';

export default {
    data () {
        return {
            railheight: 1.2,
            floorradius: 6,
        }
    },

    components: {
        UserContact,
        UserContent,
        UserEvent,
        UserPerson
    },



    computed: {
        sortedLSObjs() {
            var sorted = this.LSObjs;
            sorted.sort(function (a, b) {
                return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
            });
            return sorted;
        },
        itemsCurrent: function() {
            var items;
            if (this.$store.state.facet === 'contacts') {
                items = this.$store.state.objects.contacts.slice(this.pageStart, this.pageStart + this.numberOfSegments);
            }
            else if (this.$store.state.facet === 'content') {
                items = this.$store.state.objects.content.slice(this.pageStart, this.pageStart + this.numberOfSegments);
            }
            else if (this.$store.state.facet === 'events') {
                items = this.$store.state.objects.events.slice(this.pageStart, this.pageStart + this.numberOfSegments);
            }
            return items;
        },
        items() {
            return this.sortedLSObjs.slice(this.pageStart, this.pageStart + this.numberOfSegments);
        },
        totalItems() {
            return this.LSObjs.length;
        },
        numberOfItemsToDisplay() {
            return Math.min(this.numberOfSegments, this.items.length);
        },
        // vuex store
        ...mapState('xr',
            [
                'LSObjs',
                'roomConfig'
            ]
        ),
        ...mapState('xr/carousel',
            [
                'pageStart',
                'numberOfSegments'
            ]
        ),
        ...mapState('xr/graphics',
            [
                'bump',
                'normal'
            ]
        ),
    },

    methods: {
        imageSrc: function (image) {
            if(!image)
                return '';
            else
                return this.roomConfig.bucket_route + '/' + this.roomConfig.BUCKET_NAME + '/' + image.route;
        },
        railRotation: function(segment) {
            var u = segment / this.numberOfSegments + 0.5 / this.numberOfSegments;
            // 0.5/36 to get to the post
            var theta =  (-3*Math.PI/4) - (u * Math.PI * 2);

            var roty = theta * (180/Math.PI) + 5;
            var rotx = 0;

            return `${rotx} ${roty} 0`;
        },
        railPosition: function(segment) {
            var u = segment / this.numberOfSegments + 0.5 / this.numberOfSegments;
            // 0.5/36 to get to the post
            var theta = (-3*Math.PI/4) - (u * Math.PI * 2);

            var sinTheta = Math.sin( theta );
            var cosTheta = Math.cos( theta );

            var x = this.floorradius * sinTheta;
            var z = this.floorradius * cosTheta;

            return `${x} 0 ${z}`;
        },
        dioramaRotation: function(segment) {
            var u = segment / this.numberOfSegments + 0.5 / this.numberOfSegments;
            // 0.5/36 to get to the post
            var theta =  (-3*Math.PI/4) - (u * Math.PI * 2);

            var roty = theta * (180/Math.PI);
            var rotx = 0;
            var rotz = 0;

            return `${rotx} ${roty} ${rotz}`;
        },
        dioramaPosition: function(segment) {
            var u = segment / this.numberOfSegments + 0.5 / this.numberOfSegments;
            // 0.5/36 to get to the post
            var theta = (-3*Math.PI/4) - (u * Math.PI * 2);

            var sinTheta = Math.sin( theta );
            var cosTheta = Math.cos( theta );

            var x = this.floorradius * sinTheta;
            var z = this.floorradius * cosTheta;

            return `${x} 0 ${z}`;
        },
    },
  }
</script>