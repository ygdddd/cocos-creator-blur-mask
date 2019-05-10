const { ccclass, property } = cc._decorator;

@ccclass
export default class BlurMask extends cc.Component {

	camera: cc.Camera = null;
	texture: cc.RenderTexture = null;
	spriteFrame: cc.SpriteFrame = null;
	sprite: cc.Sprite = null;

	_lastSize = new cc.Size(0, 0);

	// 用于模糊的材质
	// @ts-ignore
	@property(cc.Material) material: cc.Material = null;

	@property([cc.Node])
	ignoredNodes = [];

	start() {
		// 截图图像是翻转的，所以y轴镜像
		this.node.scaleY = -1;

		// 创建渲染贴图对象
		this.texture = new cc.RenderTexture();
		this.texture.initWithSize(this.node.width, this.node.height);

		// 在node上创建摄影机
		this.camera = this.node.addComponent(cc.Camera);
		// 不渲染0x10的cullingMask对象
		this.camera.cullingMask = 0xffffffff ^ 0x10000000;
		this.camera.targetTexture = this.texture;
		// 关闭摄影机，否则每一帧它会自动进行渲染
		this.camera.enabled = false;

		// 将自身与忽略对象排除渲染
		this.node['_cullingMask'] = 0x10000000;
		this.ignoredNodes.map(node => node['_cullingMask'] = 0x10000000);

		// 创建一个sprite组件，由其进行渲染
		this.spriteFrame = new cc.SpriteFrame();
		this.sprite = this.node.addComponent(cc.Sprite);
		this.sprite.spriteFrame = this.spriteFrame;
		this.sprite['_materials'][0] = this.material;
	}

	// 截图并模糊
	snapshot() {
		let size = this.node.getContentSize();

		if(size.width !== this._lastSize.width || size.height !== this._lastSize.height){
			// 大小发生改变，重新设置texture大小
			this.texture.initWithSize(this.node.width, this.node.height);
			this.camera.targetTexture = this.texture;
		}

		this._lastSize.width = size.width;
		this._lastSize.height = size.height;

		// 手动渲染摄影机，保存截图
		this.camera.render(cc.Canvas.instance.node);
		// 应用刚刚截图的贴图到sprite身上进行渲染
		this.spriteFrame.setTexture(this.texture, this.node.getBoundingBoxToWorld(), false, cc.Vec2.ZERO, this.node.getContentSize());
	}

	update(dt) {
		// 每一帧都进行截图处理，可以换成需要的时候再调用，比较省资源
		this.snapshot();
	}
}
