! function(c) {
	var a = function(f, e) {
		this.init(f, e)
	};
	a.prototype = {
		constructor: a,
		init: function(f, e) {
			this.$element = c(f);
			this.options = c.extend({}, c.fn.modalmanager.defaults, this.$element.data(), typeof e == "object" && e);
			this.stack = [];
			this.backdropCount = 0;
			if(this.options.resize) {
				var h, g = this;
				c(window).on("resize.modal", function() {
					h && clearTimeout(h);
					h = setTimeout(function() {
						for(var j = 0; j < g.stack.length; j++) {
							g.stack[j].isShown && g.stack[j].layout()
						}
					}, 10)
				})
			}
		},
		createModal: function(f, e) {
			c(f).modal(c.extend({
				manager: this
			}, e))
		},
		appendModal: function(f) {
			this.stack.push(f);
			var e = this;
			f.$element.on("show.modalmanager", b(function(h) {
				var g = function() {
					f.isShown = true;
					var i = c.support.transition && f.$element.hasClass("fade");
					e.$element.toggleClass("modal-open", e.hasOpenModal()).toggleClass("page-overflow", c(window).height() < e.$element.height());
					f.$parent = f.$element.parent();
					f.$container = e.createContainer(f);
					f.$element.appendTo(f.$container);
					e.backdrop(f, function() {
						f.$element.show();
						if(i) {
							f.$element[0].offsetWidth
						}
						f.layout();
						f.$element.addClass("in").attr("aria-hidden", false);
						var j = function() {
							e.setFocus();
							f.$element.trigger("shown")
						};
						i ? f.$element.one(c.support.transition.end, j) : j()
					})
				};
				f.options.replace ? e.replace(g) : g()
			}));
			f.$element.on("hidden.modalmanager", b(function(g) {
				e.backdrop(f);
				if(!f.$element.parent().length) {
					e.destroyModal(f)
				} else {
					if(f.$backdrop) {
						var h = c.support.transition && f.$element.hasClass("fade");
						if(h) {
							f.$element[0].offsetWidth
						}
						c.support.transition && f.$element.hasClass("fade") ? f.$backdrop.one(c.support.transition.end, function() {
							f.destroy()
						}) : f.destroy()
					} else {
						f.destroy()
					}
				}
			}));
			f.$element.on("destroyed.modalmanager", b(function(g) {
				e.destroyModal(f)
			}))
		},
		getOpenModals: function() {
			var f = [];
			for(var e = 0; e < this.stack.length; e++) {
				if(this.stack[e].isShown) {
					f.push(this.stack[e])
				}
			}
			return f
		},
		hasOpenModal: function() {
			return this.getOpenModals().length > 0
		},
		setFocus: function() {
			var f;
			for(var e = 0; e < this.stack.length; e++) {
				if(this.stack[e].isShown) {
					f = this.stack[e]
				}
			}
			if(!f) {
				return
			}
			f.focus()
		},
		destroyModal: function(f) {
			f.$element.off(".modalmanager");
			if(f.$backdrop) {
				this.removeBackdrop(f)
			}
			this.stack.splice(this.getIndexOfModal(f), 1);
			var e = this.hasOpenModal();
			this.$element.toggleClass("modal-open", e);
			if(!e) {
				this.$element.removeClass("page-overflow")
			}
			this.removeContainer(f);
			this.setFocus()
		},
		getModalAt: function(e) {
			return this.stack[e]
		},
		getIndexOfModal: function(f) {
			for(var e = 0; e < this.stack.length; e++) {
				if(f === this.stack[e]) {
					return e
				}
			}
		},
		replace: function(g) {
			var f;
			for(var e = 0; e < this.stack.length; e++) {
				if(this.stack[e].isShown) {
					f = this.stack[e]
				}
			}
			if(f) {
				this.$backdropHandle = f.$backdrop;
				f.$backdrop = null;
				g && f.$element.one("hidden", b(c.proxy(g, this)));
				f.hide()
			} else {
				if(g) {
					g()
				}
			}
		},
		removeBackdrop: function(e) {
			e.$backdrop.remove();
			e.$backdrop = null
		},
		createBackdrop: function(g, f) {
			var e;
			if(!this.$backdropHandle) {
				e = c(f).addClass(g).appendTo(this.$element)
			} else {
				e = this.$backdropHandle;
				e.off(".modalmanager");
				this.$backdropHandle = null;
				this.isLoading && this.removeSpinner()
			}
			return e
		},
		removeContainer: function(e) {
			e.$container.remove();
			e.$container = null
		},
		createContainer: function(e) {
			var f;
			f = c('<div class="modal-scrollable">').css("z-index", d("modal", this.getOpenModals().length)).appendTo(this.$element);
			if(e && e.options.backdrop != "static") {
				f.on("click.modal", b(function(g) {
					e.hide()
				}))
			} else {
				if(e) {
					f.on("click.modal", b(function(g) {
						e.attention()
					}))
				}
			}
			return f
		},
		backdrop: function(h, j) {
			var f = h.$element.hasClass("fade") ? "fade" : "",
				i = h.options.backdrop && this.backdropCount < this.options.backdropLimit;
			if(h.isShown && i) {
				var e = c.support.transition && f && !this.$backdropHandle;
				h.$backdrop = this.createBackdrop(f, h.options.backdropTemplate);
				h.$backdrop.css("z-index", d("backdrop", this.getOpenModals().length));
				if(e) {
					h.$backdrop[0].offsetWidth
				}
				h.$backdrop.addClass("in");
				this.backdropCount += 1;
				e ? h.$backdrop.one(c.support.transition.end, j) : j()
			} else {
				if(!h.isShown && h.$backdrop) {
					h.$backdrop.removeClass("in");
					this.backdropCount -= 1;
					var g = this;
					c.support.transition && h.$element.hasClass("fade") ? h.$backdrop.one(c.support.transition.end, function() {
						g.removeBackdrop(h)
					}) : g.removeBackdrop(h)
				} else {
					if(j) {
						j()
					}
				}
			}
		},
		removeSpinner: function() {
			this.$spinner && this.$spinner.remove();
			this.$spinner = null;
			this.isLoading = false
		},
		removeLoading: function() {
			this.$backdropHandle && this.$backdropHandle.remove();
			this.$backdropHandle = null;
			this.removeSpinner()
		},
		loading: function(h) {
			h = h || function() {};
			this.$element.toggleClass("modal-open", !this.isLoading || this.hasOpenModal()).toggleClass("page-overflow", c(window).height() < this.$element.height());
			if(!this.isLoading) {
				this.$backdropHandle = this.createBackdrop("fade", this.options.backdropTemplate);
				this.$backdropHandle[0].offsetWidth;
				var e = this.getOpenModals();
				this.$backdropHandle.css("z-index", d("backdrop", e.length + 1)).addClass("in");
				var g = c(this.options.spinner).css("z-index", d("modal", e.length + 1)).appendTo(this.$element).addClass("in");
				this.$spinner = c(this.createContainer()).append(g).on("click.modalmanager", c.proxy(this.loading, this));
				this.isLoading = true;
				c.support.transition ? this.$backdropHandle.one(c.support.transition.end, h) : h()
			} else {
				if(this.isLoading && this.$backdropHandle) {
					this.$backdropHandle.removeClass("in");
					var f = this;
					c.support.transition ? this.$backdropHandle.one(c.support.transition.end, function() {
						f.removeLoading()
					}) : f.removeLoading()
				} else {
					if(h) {
						h(this.isLoading)
					}
				}
			}
		}
	};
	var d = (function() {
		var f, e = {};
		return function(g, j) {
			if(typeof f === "undefined") {
				var i = c('<div class="modal hide" />').appendTo("body"),
					h = c('<div class="modal-backdrop hide" />').appendTo("body");
				e.modal = +i.css("z-index");
				e.backdrop = +h.css("z-index");
				f = e.modal - e.backdrop;
				i.remove();
				h.remove();
				h = i = null
			}
			return e[g] + (f * j)
		}
	}());

	function b(e) {
		return function(f) {
			if(f && this === f.target) {
				return e.apply(this, arguments)
			}
		}
	}
	c.fn.modalmanager = function(f, e) {
		return this.each(function() {
			var h = c(this),
				g = h.data("modalmanager");
			if(!g) {
				h.data("modalmanager", (g = new a(this, f)))
			}
			if(typeof f === "string") {
				g[f].apply(g, [].concat(e))
			}
		})
	};
	c.fn.modalmanager.defaults = {
		backdropLimit: 999,
		resize: true,
		spinner: '<div class="loading-spinner fade" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>',
		backdropTemplate: '<div class="modal-backdrop" />'
	};
	c.fn.modalmanager.Constructor = a;
	c(function() {
		c(document).off("show.bs.modal").off("hidden.bs.modal")
	})
}(jQuery);