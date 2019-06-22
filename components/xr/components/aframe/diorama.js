import textureLoaderHelper from './textureLoaderHelper.js';


function _buildMaterial(type, quality='l', withBump=false, withNormal=false, repeatU=1, repeatV=1, props={}) {
    var material, baseTexture, bumpTexture, nomralTexture;
    var tlHelper = new textureLoaderHelper();

    if (type=='glass') {
        material = new THREE.MeshPhysicalMaterial( 
            {
                color: props.color,
                metalness: props.metalness,
                reflectivity: props.reflectivity,
                roughness: props.roughness,
                opacity: props.opacity,
                side: THREE.DoubleSide,
                transparent: true,
                envMapIntensity: 5,
                premultipliedAlpha: true,
        });
        return material
    }

    baseTexture = tlHelper.loadTexture( type, 'base', quality, 'jpg',
        function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.offset.set( 0, 0 );
            texture.repeat.set( repeatU, repeatV );
    });
    
    
    // Material
    material = new THREE.MeshPhongMaterial( { map: baseTexture,
        side:THREE.FrontSide,
        specular: 0x222222,
        shininess: 25,
        } );

    if (withBump) {
        bumpTexture = tlHelper.loadTexture( type, 'height', quality, 'jpg',
            function (texture) {
                material.bumpMap = texture;
                material.bumpScale = 1;
            }
        );
    }
    if (withNormal) {
        nomralTexture = tlHelper.loadTexture( type, 'normal', quality, 'jpg',
            function (texture) {
                material.normalMap = texture;
            }
        );
    }
    return material;
}

function _buildGeometry(type, data) {
    var geom, height, width, depth;
    var x, y, z;
    x = data.x;
    y = data.y;
    z = data.z;
    switch (type) {
        case 'column':
            height = data.railheight + 0.01;
            geom =  new THREE.CylinderBufferGeometry( data.columnradius,
                data.columnradius,
                height,
                data.radialsegments, 1, false );

            geom.translate(x,
                y + height/2,
                z);
            break;
    
        case 'sphere':
            var radius = data.columnradius * (3/2);
            height = data.railheight + 0.01 + radius;
            geom = new THREE.SphereBufferGeometry( radius,
                data.radialsegments, data.radialsegments );
        
            geom.translate(x,
                y + height,
                z);
            break;
        case 'case':
            geom = new THREE.BoxBufferGeometry( data.width, data.height, data.depth );
            geom.rotateX(2 * Math.PI * data.rotationx / 360);
            geom.translate(x + data.offset.x, y + data.offset.y, z + data.offset.z)
            break;
        case 'base':
        case 'trim':
        case 'glass':
            width = (data.floorradius) * Math.sin(2 * Math.PI / data.radialsegments);
            if (type == 'glass') { height = data.railheight - (2*data.baseheight); depth = data.basedepth - 0.01; }
            else if (type == 'base') { height = data.baseheight; depth = data.basedepth; }
            else if (type == 'trim') { height = data.trimheight; depth = 0.01;}
        
            var shape = new THREE.Shape();
        
            shape.moveTo( -width/2, -height/2 );
            shape.lineTo( -width/2, height/2 );
            shape.lineTo( width/2, height/2 );
            shape.lineTo( width/2, -height/2 );
            shape.lineTo( -width/2, -height/2 );
        
            var extrudeSettings = {
                steps: 2,
                depth: depth,
                //amount: self.data.depth, // aframe 8.2 / three.js r92
                bevelEnabled: type == 'trim' ? false : true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelSegments: 1
            };
            geom = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );

            if (type == 'base') {
                if (data.pos == 'top') {
                    y += data.railheight - data.baseheight - 0.01;
                }
            }
            else if (type == 'trim') {
                if (data.side == 'front') {
                    z += 0.02;
                }
                else if (data.side == 'back') {
                    z -= 0.02;
                }
                if (data.pos == 'top') {
                    y += data.railheight - data.baseheight - 0.02;
                }
                else {
                    y += data.baseheight;
                }
            }
            else if (type == 'glass') {
                y += data.baseheight;
            }
 
            geom.translate(x + (width/2),
                        y + height/2,
                        z - depth/2);
            break;
        default:
            break;
    }
    return geom;
}


AFRAME.registerComponent('diorama-rail', {
    schema: {
        x: { type: 'number', default: 0},
        y: { type: 'number', default: 0},
        z: { type: 'number', default: 0},

        railheight: { type: 'number', default: 1.2 },
        baseheight: { type: 'number', default: 0.075 },
        trimheight: { type: 'number', default: 0.01 },
        basedepth: { type: 'number', default: 0.03 },
        columnradius: { type: 'number', default: 0.05 },

        radialsegments: { type: 'number', default: 36 },
        floorradius: { type: 'number', default: 6},

        color: { default: 0xe8f1ff}, //0xe8f1ff
        opacity: { type: 'number', default: 0.2 },
        metalness: { type: 'number', default: 0.0 },
        reflectivity: { type: 'number', default: 0.5 },
        roughness: { type: 'number', default: 0.2 },

        repeatU: { type: 'number', default: 4},
        repeatV: { type: 'number', default: 1},

        withBump: { default: false },
        withNormal: { default: false },
        quality: { default: 'l' }, //, oneOf: ['s', 'm', 'l']
    },

    multiple: true,

    update: function() {
        var self = this;
        if (self.el.object3DMap.hasOwnProperty(self.id)) {
            self.el.removeObject3D(self.id);
        }
        if (self.id != undefined) {
            self._createRail();
        }
    },

    _createRail() {
        var data = this.data;
        this._createDioramaComponent('bronze', 'column');
        this._createDioramaComponent('bronze', 'sphere');
        this._createDioramaComponent('wood-panel', 'base');
        this._createDioramaComponent('wood-panel', 'base', 'top');
        this._createDioramaComponent('bronze', 'trim', '', 'front');
        this._createDioramaComponent('bronze', 'trim', '', 'back');
        this._createDioramaComponent('bronze', 'trim', 'top', 'front');
        this._createDioramaComponent('bronze', 'trim', 'top', 'back');
        this._createDioramaComponent('glass', 'glass', '', '', {
            color: data.color,
            metalness: data.metalness,
            reflectivity: data.reflectivity,
            roughness: data.roughness,
            opacity: data.opacity,
        });
    },

    _createDioramaComponent(type, shape,  pos='', side='front', props={}) {
        var self = this;
        var material, geom, mesh;
        var data = self.data;
        data.pos = pos;
        data.side = side;
    
        material = _buildMaterial(type, data.quality, data.withBump, data.withNormal, data.repeatU, data.repeatV, props);
        geom = _buildGeometry(shape, data);
        mesh = new THREE.Mesh(geom, material);
    
        var group = self.el.getObject3D(self.id) || new THREE.Group();
        group.add(mesh);
        self.el.setObject3D(self.id, group); 
    },

});


AFRAME.registerPrimitive( 'a-rail', {
    defaultComponents: {
        'diorama-rail__rail': { 
            'railheight': 1.2
        },

    },
    mappings: {
        'radius': 'diorama-rail.floorradius',
        'bump': 'diorama-rail.withBump',
        'normal': 'diorama-rail.withNormal',
        'quality': 'diorama-rail.quality',
        'radialsegments': 'diorama-rail.radialsegments'
    }
});


AFRAME.registerComponent('diorama-case', {
    schema: {
        x: { type: 'number', default: 0},
        y: { type: 'number', default: 0},
        z: { type: 'number', default: 0},
        rotationx: { type: 'number', default: 30 }, // degrees

        imageURL: {type: 'string', default: ''},
        srcFit: { type: 'string', default: 'width' },

        imagewidth: { type: 'number', default: 0.6 },
        imageheight: { type: 'number', default: 0.6 },

        textPadding: { type: 'number', default: 0.01 },

        casedepth: { type: 'number', default: 0.06 },
        bronzedepth: { type: 'number', default: 0.01 },
        casemargin: { type: 'number', default: 0.05 },

        railheight: { type: 'number', default: 1.2 },

        color: { default: 0xe8f1ff}, //0xe8f1ff
        opacity: { type: 'number', default: 0.2 },
        metalness: { type: 'number', default: 0.0 },
        reflectivity: { type: 'number', default: 0.5 },
        roughness: { type: 'number', default: 0.2 },

        repeatU: { type: 'number', default: 4},
        repeatV: { type: 'number', default: 1},

        withBump: { default: false },
        withNormal: { default: false },
        quality: { default: 'l' }, //, oneOf: ['s', 'm', 'l']

        textColor: { default: 'white' },
        contentType: { type: 'string', default: '' },
        type: { type: 'string', default: '' },
        title: { type: 'string', default: '' },
        textt: { type: 'string', default: '' },
        url: { type: 'string', default: '' },
        provider: { type: 'string', default: '' },
        connectionName: { type: 'string', default: '' },
        // tags: { default: [] },
    },

    multiple: true,
  
    update: function() {
        var self = this;
        if (self.el.object3DMap.hasOwnProperty(self.id)) {
            self.el.removeObject3D(self.id);
        }
        if (self.el.object3DMap.hasOwnProperty('image')) {
            self.el.removeObject3D('image');
        }

        if (self.id != undefined) {
            self._createDiorama();
        }

        if (self.data.contentType == 'Image') {
            self._createImage();
        }
        else {
            if (self.data.title != undefined){
                self._createText();
            }
        }
        
    },

    _createDiorama() {
        var self = this;
        var data = self.data;

        self._createCase(
            'glass',
            data.imagewidth + data.casemargin,
            data.imageheight + data.casemargin,
            data.casedepth,
            {
                x: 0,
                y: data.railheight + 0.3,
                z: -.15 + data.casedepth/2 + 2*data.bronzedepth
            },
            {
                color: data.color,
                metalness: data.metalness,
                reflectivity: data.reflectivity,
                roughness: data.roughness,
                opacity: data.opacity,
            }
        );
        self._createCase(
            'bronze',
            data.imagewidth,
            data.imageheight,
            data.bronzedepth,
            {
                x: 0,
                y: data.railheight + 0.3,
                z: -.15 + 1.5*data.bronzedepth
            }
        );
        self._createCase(
            'wood',
            data.imagewidth + 0.06,
            data.imageheight + 0.07,
            data.bronzedepth*2,
            {
                x: 0,
                y: data.railheight + 0.3,
                z: -.15 + data.casedepth + 3*data.bronzedepth
            }
        );
        self._createCase(
            'bronze',
            0.03,
            0.03,
            0.2,
            {
                x: 0,
                y: data.railheight + 0.3 + Math.cos(2 * Math.PI * data.rotationx / 360) * -0.2 + 0.04,
                z: -.05 + data.casedepth + 3*data.bronzedepth + Math.sin(2 * Math.PI * data.rotationx / 360) * -0.2 - 0.04
            }
            
        );
    },

    _createImage() {
        var self = this;
        var data = self.data;

        var imgMaterial, colorMaterial, geom, mesh;

        data.offset = {
            x: 0,
            y: data.railheight + 0.3,
            z: -.15
        }
    
        var texture = new THREE.TextureLoader().load( data.imageURL, function () {
            var srcWidth = texture.image.videoWidth || texture.image.width;
            var srcHeight = texture.image.videoHeight || texture.image.height;
            var aspectRatio = (srcWidth || 1.0) / (srcHeight || 1.0);
            var geomWidth, geomHeight;
            if (data.srcFit == 'width') {
                geomWidth = data.imagewidth;
                geomHeight = data.imagewidth / aspectRatio;
            }
            else {
                geomWidth = data.imageheight * aspectRatio;
                geomHeight = data.imageheight;
            }
            
            geom = new THREE.BoxBufferGeometry(geomWidth, geomHeight, data.bronzedepth );
            geom.rotateX(2 * Math.PI * data.rotationx / 360);
            geom.translate(data.offset.x, data.offset.y, data.offset.z);
    
            imgMaterial = new THREE.MeshBasicMaterial( { map: texture } );
            colorMaterial = new THREE.MeshBasicMaterial( {color: new THREE.Color( 0xffffff )} );
    
            var materials = [
                colorMaterial,        // Left side
                colorMaterial,       // Right side
                colorMaterial,         // Top side
                colorMaterial,      // Bottom side
                colorMaterial,       // Front side
                imgMaterial         // Back side
            ];
            mesh = new THREE.Mesh(geom, materials);
    
            var group = self.el.getObject3D('image') || new THREE.Group();
            group.add(mesh);
            self.el.setObject3D('image', group);   
        } );
    },

    _createCase(type, width, height, depth, offset, props={}) {
        var self = this;
        var material, geom, mesh;
        var data = self.data;

        data.width = width;
        data.height = height;
        data.depth = depth;
        data.offset = offset;
    
        material = _buildMaterial(type, data.quality, data.withBump, data.withNormal, data.repeatU, data.repeatV, props);
        geom = _buildGeometry('case', data);
        mesh = new THREE.Mesh(geom, material);
    
        var group = self.el.getObject3D(self.id) || new THREE.Group();
        group.add(mesh);
        self.el.setObject3D(self.id, group); 
    },

    _createText() {
        var self = this;
        var data = self.data;
        var el = self.el;

        var text = '';
        text += data.provider ? data.provider + '\t': '';//+ '\n\n' : '';
        text += data.connectionName ? data.connectionName + '\n\n' : '\n\n';
        text += data.type ? data.type + '\n\n' : '';
        text += data.title ? data.title + '\n\n' : '';
        text += data.textt ? data.textt.slice(0, 400) + '\n\n' : '';
        text += data.url ? data.url + '\n\n' : '';

        var textEl = document.createElement('a-entity');
        textEl.setAttribute('width', data.imagewidth);
        textEl.setAttribute('height', data.imageheight);
        textEl.setAttribute('text', {
            value: text,
            width: data.imagewidth ,//- 2*data.textPadding,
            height: data.imageheight,
            xOffset: data.textPadding,
            color: data.textColor
        });
        textEl.object3D.position.y += data.imageheight/2;
        textEl.object3D.rotation.set(
            THREE.Math.degToRad(data.rotationx),
            THREE.Math.degToRad(180),
            THREE.Math.degToRad(0)
          );
        var dx = data.x;
        var dy = data.y + data.railheight;
        var dz = data.z - 0.15;
        textEl.object3D.position.x += dx;
        textEl.object3D.position.y += dy;
        textEl.object3D.position.z += dz;
        el.appendChild(textEl);
    }

});


AFRAME.registerPrimitive( 'a-diorama', {
    defaultComponents: {
        'diorama-case__case': { 
            'railheight': 1.2
        },

    },
    mappings: {
        'bump': 'diorama-case.withBump',
        'normal': 'diorama-case.withNormal',
        'quality': 'diorama-case.quality',
        'src': 'diorama-case.imageURL',
        'srcfit': 'diorama-case.srcFit',
        'contenttype': 'diorama-case.contentType',
        'type': 'diorama-case.type',
        'title': 'diorama-case.title',
        'textt': 'diorama-case.textt',
        'url': 'diorama-case.url',
        'provider': 'diorama-case.provider',
        'connectionname': 'diorama-case.connectionName',
        // 'tags': 'diorama-case.tags',
    }
});


AFRAME.registerComponent('diorama-content', {
    schema: {
        x: { type: 'number', default: 0},
        y: { type: 'number', default: 0},
        z: { type: 'number', default: 0},
        rotationx: { type: 'number', default: 30 }, // degrees

        width: { type: 'number', default: 1 },
        height: { type: 'number', default: 1 },

        lineheight: { type: 'number', default: 0.1 },

        providerIcon: { default: '' },
        contentIcon: { default: '' },
        textPadding: { type: 'number', default: 0.1 },
        zTextOffset: { type: 'number', default: 0.1 },

        railheight: { type: 'number', default: 1.2 },

        opacity: { type: 'number', default: 0.6 },

        textColor: { default: 'white' },
        contentType: { type: 'string', default: '' },
        type: { type: 'string', default: '' },
        title: { type: 'string', default: '' },
        textt: { type: 'string', default: '' },
        url: { type: 'string', default: '' },
        provider: { type: 'string', default: '' },
        connectionName: { type: 'string', default: '' },
        // tags: { default: [] },
    },

    update: function() {
        var self = this;
        var data = self.data;
        self._createBackground();

        var offset = {x:0, y:-0.3, z:0}

        var textStyle = {
            color: data.textColor
        }

        self._addIcon(data.providerIcon, offset);
        self._createText(data.provider, offset, textStyle);
        offset.y -= data.lineheight;

        self._addIcon(data.contentIcon, offset);
        self._createText(data.type, offset, textStyle);
        offset.y -= data.lineheight;

        self._createText(data.title, offset, textStyle);
        offset.y -= data.lineheight;

        textStyle.color = 'blue';
        self._createText(data.textt, offset, textStyle);

        offset.y -= data.lineheight;
        
    },

    _createBackground() {
        var self = this;
        var data = self.data;
        var loader = new THREE.TextureLoader();
        const map = loader.load('xr/diorama.png');
        const geometry = new THREE.PlaneGeometry(data.width, data.height, 1, 1);
		const material = new THREE.MeshBasicMaterial({
            // color: data.bgcolor,
            map: map,
			opacity: data.opacity,
			transparent: true,
			// blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide
        });
        var offset = {
            x: 0,
            y: data.railheight + 0.3,
            z: -.15
        }

        geometry.translate(data.x + offset.x, data.y + offset.y, data.z + offset.z)
        var mesh = new THREE.Mesh(geometry, material);
        var group = self.el.getObject3D('background') || new THREE.Group();
        group.add(mesh);
        self.el.setObject3D('background', group); 
    },

    _createText(text, offset, textStyle) {
        var self = this;
        var data = self.data;
        var el = self.el;


        var textEl = document.createElement('a-entity');
        textEl.setAttribute('width', data.width);
        textEl.setAttribute('height', data.lineheight);
        textEl.setAttribute('text', {
            value: text,
            width: data.width ,//- 2*data.textPadding,
            height: data.lineheight,
            xOffset: data.textPadding,
            zOffset: data.textPadding,
            color: textStyle.color
        });
        textEl.object3D.position.y += data.height - data.textPadding;
        textEl.object3D.rotation.set(
            0,//THREE.Math.degToRad(data.rotationx),
            THREE.Math.degToRad(180),
            THREE.Math.degToRad(0)
          );
        var dx = data.x;
        var dy = data.y + data.railheight + offset.y;
        var dz = data.z - 0.15;
        textEl.object3D.position.x += dx;
        textEl.object3D.position.y += dy;
        textEl.object3D.position.z += dz;
        el.appendChild(textEl);
    },

    _addIcon(iconName, offset) {
        var self = this;
        var data = self.data;
        var el = self.el;

        var iconEl = document.createElement('a-entity');//'a-ionicon');
        iconEl.setAttribute('ionicon', {
            icon: iconName,
            width: 0.2,
            height: 0.2
        });

        iconEl.object3D.position.y += data.height - data.textPadding;
        iconEl.object3D.rotation.set(
            0,//THREE.Math.degToRad(data.rotationx),
            THREE.Math.degToRad(180),
            THREE.Math.degToRad(0)
          );
        var dx = data.x + offset.x - data.width/2 + data.textPadding;
        var dy = data.y + data.railheight + offset.y;
        var dz = data.z - 0.15 + offset.z;
        iconEl.object3D.position.x += dx;
        iconEl.object3D.position.y += dy;
        iconEl.object3D.position.z += dz;
        el.appendChild(iconEl);
    }
});

AFRAME.registerPrimitive( 'a-diorama-content', {
    defaultComponents: {
        'diorama-content': {
            'railheight': 1.2
        },

    },
    mappings: {
        'contenttype': 'diorama-content.contentType',
        'type': 'diorama-content.type',
        'title': 'diorama-content.title',
        'textt': 'diorama-content.textt',
        'url': 'diorama-content.url',
        'provider': 'diorama-content.provider',
        'connectionname': 'diorama-content.connectionName',
        'providericon': 'diorama-content.providerIcon',
        'contenticon': 'diorama-content.contentIcon',
    }
})