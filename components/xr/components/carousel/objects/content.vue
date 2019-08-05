<template>
    <a-entity class="carousel-item carousel-content-item" v-bind:id="content.id">
		<a-diorama v-if="content.embed_content == 'image'"
			:contenttype="contentType"
			:type="content.type"
			:src="content.embed_content"
			:title="content.title"
			:textt="content.text"
			:url="content.url"
			:provider="connection.provider.name"
			:connectionname="connection.name"
			:providericon="providerIonicon"
			:contenticon="contentTypeIonicon"
            :radius="floorRadius"
            :railheight="railHeight"
            :radialsegments="numberOfSegments"
            :bump="bump"
            :normal="normal"
            :quality="textureQuality"
            :shading="textureShading"
			/>
		<a-diorama-object v-else
			facet='content'
			:contenttype="contentType"
			:type="content.type"
			:src="content.embed_content"
			:title="content.title"
			:textt="content.text"
			:url="content.url"
			:provider="connection.provider.name"
			:connectionname="connection.name"
			:providericon="providerIonicon"
			:contenticon="contentTypeIonicon"
            :radius="floorRadius"
            :railheight="railHeight"
            :radialsegments="numberOfSegments"
            :bump="bump"
            :normal="normal"
            :quality="textureQuality"
            :shading="textureShading"
			/>
			<!-- :tags="content.tags" -->
	</a-entity>
</template>

<script>
var CONFIG = {};
CONFIG.DEBUG = false;
import { mapState } from 'vuex';

import { GraphicsQualityEnum, ShadingEnum } from '../../../../../store/modules/xr/modules/graphics';

import icons from '../../../../../lib/util/icons';
import FAIonicon from '../../aframe/font-awesome-ionicons';

const audioTypes = ['mp3', 'ogga', 'wav'];
const imageTypes = ['png', 'jpg', 'jpeg', 'svg', 'tiff', 'bmp', 'webp'];
const videoTypes = ['mp4', 'oggv', 'webm'];

export default {
	data () {
        return {
			size: 1,
			iconSize: 0.25,
        }
    },
	props: ['content', 'connection'],

	computed: {
		contentType: function() {
			switch (this.content.embed_format.toLowerCase()) {
				case 'mp3':
				case 'ogga':
				case 'wav':
					return 'Audio';
				case 'email':
					return 'Email';
				case 'iframe':
					return 'Iframe';
				case 'png':
				case 'jpg':
				case 'jpeg':
				case 'svg':
				case 'tiff':
				case 'bmp':
				case 'webp':
					return 'Image';
				case 'mp4':
				case 'oggv':
				case 'webm':
					return 'Video';
				default:
					return '';
			}
		
		},
		contentTypeIonicon: function() {
			var icon = icons('content', this.content.type);
			var regex=/fa\-[a-zA-Z\-]+/i;
			return FAIonicon[icon.match(regex)[0]];
		},
		providerIonicon: function() {
			var icon = icons('provider', this.connection.provider.name);
			var regex=/fa\-[a-zA-Z\-]+/i;
			return FAIonicon[icon.match(regex)[0]];
		},
        textureQuality() {
			switch (this.quality) {
                case GraphicsQualityEnum.LOW:
                    return 's';
                case GraphicsQualityEnum.MEDIUM:
                    return 'm';
                case GraphicsQualityEnum.HIGH:
                    return 'l';
                default:
                    return 'l';
            }
        },
        textureShading() {
            switch (this.shading) {
                case ShadingEnum.DEFAULT:
                    return 'default';
                case ShadingEnum.CEL:
                    return 'cel';
                default:
                    return 'default';
            }
        },
		...mapState('xr/carousel',
            [
                'pageStart',
                'numberOfSegments',
                'floorRadius',
                'railHeight'
            ]
        ),
        ...mapState('xr/graphics',
            [
                'bump',
                'normal',
                'quality',
                'shading'
            ]
        ),
    },
  }
</script>
