<template>
    <div v-if="content.hidden !== true"
         v-bind:id="content.id"
         class="object content"
    >
        <!-- header -->
        <div class="header">
            <!-- type -->
            <div class="type">
                <i v-bind:class="getContentTypeIcon(content.type)"></i>
                {{ content.type }}
            </div>

            <!-- provider -->
            <div class="provider">
                <i v-bind:class="getProviderIcon(connection.provider)"></i>
                {{ connection.name | truncate(30) }}
            </div>
        </div>

        <!-- embed content -->
        <div class="content-embed"
             data-type="content"
             v-bind:data-id="content.id"
        >
            <audio v-if="isAudio(content)"
                   v-observe-visibility="{ callback: visibilityChanged, throttle: 500 }"
                   controls
                   v-bind:style="{ width: getWidth, height: getHeight }"
            >
                <source v-bind:src="content.embed_content"
                        v-bind:type="getAudioType(content.embed_format)"
                >
            </audio>
            <img v-if="isImage(content)"
                 v-observe-visibility="{ callback: visibilityChanged, throttle: 500 }"
                 v-bind:src="content.embed_content"
                 v-bind:alt="content.title"
            />
            <video v-if="isVideo(content)"
                   v-observe-visibility="{ callback: visibilityChanged, throttle: 500 }"
                   v-bind:width="getWidth"
                   v-bind:height="getHeight"
                   controls
            >
                <source v-bind:src="content.embed_content"
                        v-bind:type="getVideoType(content.embed_format)"
                >
            </video>
            <iframe v-if="isEmail(content)"
                    v-bind:id="content.id"
                    v-observe-visibility="{ callback: emailVisibilityChanged, throttle: 500 }"
                    frameBorder="0"
                    v-bind:width="getWidth()"
                    v-bind:height="getHeight()"
            ></iframe>
            <span v-if="isIframe(content)"
                  v-bind:id="content.id"
                  v-observe-visibility="{ callback: iframeVisibilityChanged, throttle: 500 }"
                  class="iframe-wrapper"
            >
            </span>
        </div>

        <!-- embed thumbnail -->
        <div v-if="content.embed_thumbnail"
             class="thumbnail"
             v-bind:class="{ hidden: isAudio(content) || isImage(content) || isVideo(content) || isEmail(content) || isIframe(content) }"
        >
            <img v-if="content.title == null"
                 v-bind:src="content.embed_thumbnail"
            />

            <a v-else
               v-bind:href="content.url"
               target="_blank"
            >
                <img v-bind:src="content.embed_thumbnail" />
            </a>
        </div>

        <!-- title -->
        <div v-if="content.title != null && content.title.length > 0"
             class="title"
        >
            <a v-if="content.url != null && content.url.length > 0"
               v-bind:href="content.url"
               target="_blank"
            >{{
                content.title | safe }}
            </a>
            <span v-else>{{ content.title | safe }}</span>
        </div>

        <!-- amount -->
        <div v-if="content.price && content.price > 0">
            <div>${{ content.price }}</div>
        </div>

        <!-- text -->
        <div v-if="content.text != null && content.text.length > 0"
             class="text"
        >
            <!--{% if text_truncated %}-->
            <!--<a v-if="content.url && content.title == null" class="truncated" href="{{ url }}" target="_blank">{{ text_truncated | safe }}</a>-->
            <!--{% endif %}-->
            <a v-if="content.url && (content.title == null || content.title.length === 0)"
               class="full"
               v-bind:href="content.url"
               target="_blank"
            >
                {{ content.text | safe }}
            </a>

            <!--{% if text_truncated %}-->
            <!--<pre class="truncated">{{ text_truncated | safe }}</pre>-->
            <!--{% endif %}-->
            <pre v-else
                 class="full"
            >
                {{ content.text | safe }}
            </pre>
            <!--<div class="expand">More</div>-->
        </div>

        <!-- url -->
        <!-- if no title or text but there is a url -->
        <div v-if="(content.title == null || content.title.length === 0) && (content.text == null || content.text.length === 0) && content.url != null"
             class="title"
        >
            <a v-bind:href="content.url"
               target="blank"
            >
                {{ content.url | safe }}
            </a>
        </div>

        <div class="flexbox flex-row flex-space-between tag-hide">
            <div class="flexbox flex-column flex-start">
                <!-- tags -->
                <div class="tag-button"
                     v-on:click="openActionModal(content, 'content')"
                >
                    <i class="fal fa-hashtag"></i>
                    <span> Tag</span>
                </div>

                <!-- tags -->
                <div class="tags">
                    <span v-for="tag in content.tags"
                          v-bind:key="tag"
                    > #{{ tag }}</span>
                </div>
            </div>

            <div class="hide-button"
                 v-on:click="hideContent(content)"
            >
                <i class="fal fa-minus-hexagon"></i>
                Hide
            </div>
        </div>
    </div>

    <div v-else-if="content.hidden === true"
         class="content-hidden"
    >
        <div class="unhide-button"
             v-on:click="unhideContent(content)"
        >
            <i class="fal fa-plus-hexagon"></i>
            Unhide Content
        </div>
    </div>
</template>

<script>
	import $ from 'jquery';
	import _ from 'lodash';
	import actionModal from '../modals/action-modal.vue';
	import contentHide from '../../apollo/mutations/content-hide.gql';
	import contentUnhide from '../../apollo/mutations/content-unhide.gql';
	import icons from '../../lib/util/icons';

	const DEFAULT_EMBED_WIDTH = '100%';
	const DEFAULT_DESKTOP_EMBED_WIDTH = 600; //px
	const DEFAULT_EMBED_HEIGHT = 500;  //px

	const audioTypes = ['mp3', 'ogga', 'wav'];
	const imageTypes = ['png', 'jpg', 'jpeg', 'svg', 'tiff', 'bmp', 'webp'];
	const videoTypes = ['mp4', 'oggv', 'webm'];

	// const iframeTypes = ['email', 'iframe', 'link'];

	function isMobile() {
		if (window.matchMedia) {
			return window.matchMedia('(max-device-width: 1080px) and (min-device-pixel-ratio: 1.5)').matches;
		}
		else {
			return false;
		}
	}

	export default {
		filters: {
			safe: function(input) {
				return typeof input === 'string' ? input : input == null ? '' : input.toString()
			}
		},

		props: {
			connection: {
				type: Object,
				default: function() {
					return {};
				}
			},
			content: {
				type: Object,
				default: function() {
					return {};
				}
			}
		},

		data: function() {
			return {
				tags: function() {
					let tags = [];

					if (this.content.tagMasks) {
						_.forEach(this.tagMasks.source, function(tag) {
							if (tags.indexOf(tag) === -1) {
								tags.push(tag);
							}
						});

						_.forEach(this.tagMasks.added, function(tag) {
							if (tags.indexOf(tag) === -1) {
								tags.push(tag);
							}
						});

						_.forEach(this.tagMasks.removed, function(tag) {
							let index = tags.indexOf(tag);

							if (index > -1) {
								tags.splice(index, 1);
							}
						});
					}

					return tags;
				}
			}
		},

		methods: {
			getContentTypeIcon: function(type) {
				return icons('content', type)
			},

			getProviderIcon: function(provider) {
				return icons('provider', provider.name);
			},

			openActionModal: function(item, type) {
				this.$modal.show(actionModal, {
					shareable: false,
					item: item,
					taggable: true,
					type: type
				}, {
					height: 'auto',
					scrollable: true
				});
			},

			isAudio: function(item) {
				return audioTypes.indexOf(item.embed_format.toLowerCase()) > -1;
			},

			isEmail: function(item) {
				return item.embed_format.toLowerCase() === 'email';
			},

			isIframe: function(item) {
				return item.embed_format.toLowerCase() === 'iframe';
			},

			isImage: function(item) {
				return imageTypes.indexOf(item.embed_format.toLowerCase()) > -1;
			},

			isVideo: function(item) {
				return videoTypes.indexOf(item.embed_format.toLowerCase()) > -1;
			},

			getHeight: function() {
				return DEFAULT_EMBED_HEIGHT;
			},

			getWidth: function() {
				return isMobile() ? DEFAULT_EMBED_WIDTH : DEFAULT_DESKTOP_EMBED_WIDTH;
			},

			getAudioType: function(format) {
				switch (format) {
					case 'mp3':
						return 'audio/mp3';

					case 'ogga':
						return 'audio/audio';

					case 'wav':
						return 'audio/wav';

					default:
						return 'audio/audio';
				}
			},

			getVideoType: function(format) {
				switch (format) {
					case 'mp4':
						return 'video/mp4';

					case 'oggv':
						return 'video/ogg';

					case 'webm':
						return 'video/webm';

					default:
						return 'video/video';
				}
			},

			renderIframe(content) {
				let $iframe = $(content);

				if (!isMobile() && $iframe.width() > DEFAULT_DESKTOP_EMBED_WIDTH) {
					let scaleRatio = $iframe.height() / $iframe.width();
					$iframe.attr('width', $iframe.width);
					$iframe.attr('height', $iframe.width() * scaleRatio);
				}

				return $iframe.html();
			},

			renderEmailIframe(content) {
				let $iframe = $('iframe[id="' + content.id + '"]');

				let iframe = $iframe.get(0);

				if (iframe.contentDocument && iframe.contentDocument.body.innerHTML.length === 0) {
					iframe.contentDocument.body.innerHTML = content.embed_content;
				}
			},

			visibilityChanged(isVisible, entry) {
				if (isVisible) {
					let src, dataSrc, target;

					let isControls = _.find(entry.target.attributes, function(attr) {
						return attr.name === 'controls';
                    });

					if (isControls == null) {
						target = entry.target;
                    }
					else {
						target = $(entry.target).children().get(0);
                    }

					_.each(target.attributes, function(attr) {
						if (attr.name === 'data-src') {
							dataSrc = attr;
                        }

						if (attr.name === 'src') {
							src = attr;
                        }
                    });

					if (dataSrc != null) {
						src.value = dataSrc.value;
                    }
				}
			},

			emailVisibilityChanged(isVisible, entry) {
				if (isVisible) {
					let id = _.find(entry.target.attributes, function(attr) {
						return attr.name === 'id';
                    });

					let content = _.find(this.$store.state.objects.content, function(content) {
						return content.id === id.value;
					});

					this.renderEmailIframe(content);
				}
			},

			iframeVisibilityChanged(isVisible, entry) {
				if (isVisible) {
					let id = _.find(entry.target.attributes, function(attr) {
						return attr.name === 'id';
					});

					let content = _.find(this.$store.state.objects.content, function(content) {
						return content.id === id.value;
					});

					let html = $(entry.target).html();

					if (html.length === 0) {
						$(entry.target).html(content.embed_content);
					}
				}
			},

			hideContent: async function(content) {
				await this.$apollo.mutate({
					mutation: contentHide,
					variables: {
						id: content.id
					}
				});

				let match = _.find(this.$store.state.objects.content, function(item) {
					return item.id === content.id;
				});

				match.hidden = true;
			},

			unhideContent: async function(content) {
				await this.$apollo.mutate({
					mutation: contentUnhide,
					variables: {
						id: content.id
					}
				});

				let match = _.find(this.$store.state.objects.content, function(item) {
					return item.id === content.id;
				});

				match.hidden = false;
			}
		}
	}
</script>
