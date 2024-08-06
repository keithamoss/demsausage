(this.webpackJsonppublic = this.webpackJsonppublic || []).push([
	[0],
	{
		2182: function (e, t, n) {},
		2184: function (e, t, n) {},
		2358: function (e, t) {},
		2360: function (e, t, n) {
			'use strict';
			n.r(t);
			var a = n(2367),
				o = n(70),
				c = n(35),
				s = n(46),
				r = n(405),
				i = n(63),
				l = n(811),
				d = n(438),
				p = n(333),
				u =
					(n(892),
					n(893),
					n(894),
					n(904),
					n(905),
					n(906),
					n(907),
					n(909),
					n(910),
					n(911),
					n(912),
					n(914),
					n(915),
					n(916),
					n(918),
					n(919),
					n(922),
					n(165)),
				m = n(803),
				j = n(37),
				f = n(813),
				h = n(128),
				b = n(123),
				O = n(20),
				x = n.n(O),
				g = n(41),
				y = n(53),
				v = n(7),
				z = n(44),
				C = n(812),
				w = n(574),
				_ = n(137),
				S = 'ealgis/elections/LOAD_ELECTIONS',
				E = 'ealgis/elections/LOAD_ELECTION',
				k = 'ealgis/elections/SET_CURRENT_ELECTION',
				T = 'ealgis/elections/SET_DEFAULT_ELECTION',
				P = 'ealgis/elections/SET_PRIMARY_ELECTION',
				M = { elections: [] };
			var R = function (e) {
					return e.elections.elections;
				},
				A = Object(_.a)([R], function (e) {
					return e.filter(function (e) {
						return H(e);
					});
				}),
				I = Object(_.a)([R], function (e) {
					return Object(C.a)(function (t) {
						return e.find(function (e) {
							return D(e) === t;
						});
					});
				});
			function L(e) {
				return { type: k, electionId: e };
			}
			function F(e) {
				var t,
					n = e.find(function (e) {
						return e.is_primary;
					});
				if (void 0 !== n) t = n;
				else {
					var a = e.find(function (e) {
						return H(e);
					});
					t = void 0 !== a ? a : e[0];
				}
				return t;
			}
			function N(e) {
				return (function () {
					var t = Object(g.a)(
						x.a.mark(function t(n, a, o) {
							var c, s, r;
							return x.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.get('/0.1/elections/'.concat(e.id, '/stats/'), n, {});
										case 2:
											if (((c = t.sent), (s = c.response), (r = c.json), 200 !== s.status)) {
												t.next = 7;
												break;
											}
											return t.abrupt('return', r);
										case 7:
											return t.abrupt('return', null);
										case 8:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, a) {
						return t.apply(this, arguments);
					};
				})();
			}
			function D(e) {
				return encodeURI(e.name.replace(/\s/g, '_').toLowerCase());
			}
			var U = function (e) {
					return e.name
						.replace('Election ', '')
						.replace(/ian\s/, 'ia ')
						.replace(/\sBy-election\s/, ' ');
				},
				G = function (e) {
					return e.short_name.replace(/\s[0-9]{4}$/, '');
				},
				B = function (e, t, n, a) {
					return !1 === n
						? e > 3 && 'extraSmall' === a
							? G(t)
							: e > 3
								? (function (e) {
										return e.name
											.replace('Election ', '')
											.replace(/\s[0-9]{4}$/, '')
											.replace(/ian$/, 'ia')
											.replace(/\sBy-election$/, '');
									})(t)
								: U(t)
						: U(t);
				};
			var W,
				V,
				H = function (e) {
					return w.DateTime.local().endOf('day') <= w.DateTime.fromISO(e.election_day).endOf('day');
				},
				q = function (e, t, n) {
					var a,
						o = !1;
					return (
						!1 ===
							(a =
								t.length > 0
									? t
									: e.filter(function (t) {
											return t.election_day === e[0].election_day || t.is_primary;
										})).includes(n) && ((o = !0), (a = [n])),
						{ electionsToShow: a, isHistoricalElectionShown: o }
					);
				},
				Y = 'ealgis/app/LOADING',
				K = 'ealgis/app/LOADED',
				Q = 'ealgis/app/BEGIN_FETCH',
				X = 'ealgis/app/FINISH_FETCH',
				J = 'ealgis/app/SET_LAST_PAGE',
				Z = 'ealgis/app/TOGGLE_SIDEBAR',
				$ = 'ealgis/app/TOGGLE_MODAL',
				ee = 'ealgis/app/SET_POLLING_PLACE_FINDER_MODE',
				te = 'ealgis/app/SET_EMBED_MAP_FLAG';
			!(function (e) {
				(e[(e.DEV = 1)] = 'DEV'), (e[(e.TEST = 2)] = 'TEST'), (e[(e.PROD = 3)] = 'PROD');
			})(W || (W = {})),
				(function (e) {
					(e[(e.DO_NOTHING = 1)] = 'DO_NOTHING'),
						(e[(e.FOCUS_INPUT = 2)] = 'FOCUS_INPUT'),
						(e[(e.GEOLOCATION = 3)] = 'GEOLOCATION');
				})(V || (V = {}));
			var ne = {
				loading: !0,
				requestsInProgress: 0,
				sidebarOpen: !1,
				previousPath: '',
				modals: new Map(),
				geolocationSupported: 'undefined' !== typeof navigator && 'geolocation' in navigator,
				pollingPlaceFinderMode: V.DO_NOTHING,
				embedded_map: !1,
			};
			function ae() {
				return { type: Q };
			}
			function oe() {
				return { type: X };
			}
			function ce() {
				return W.PROD;
			}
			function se() {
				return ce() !== W.PROD;
			}
			var re = Object(f.a)({
					reducerPath: 'sausageApi',
					baseQuery: Object(h.d)({
						baseUrl: ''.concat('https://public-legacy.staging.democracysausage.org/api', '/0.1/'),
					}),
					endpoints: function (e) {
						return {
							getNearbyPollingPlaces: e.query({
								query: function (e) {
									return { url: 'polling_places/nearby/', params: { election_id: e.election_id, lonlat: e.lonlat } };
								},
							}),
						};
					},
				}),
				ie = re.useGetNearbyPollingPlacesQuery,
				le = n(22),
				de = n(340),
				pe = n(129),
				ue = n(575),
				me = n(104),
				je = n(5),
				fe = n(6),
				he = n(142),
				be = n(162),
				Oe = n(413),
				xe = !!window.MSInputMethodContext && !!document.documentMode;
			function ge(e, t, n) {
				var a = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0;
				if (e.length > t) {
					for (var o = t; o > 0 && ' ' !== e[o] && '-' !== e[o]; ) o -= 1;
					if (o > 0) {
						var c;
						c = '-' === e.substring(o, o + 1) ? e.substring(0, o + 1) : e.substring(0, o);
						var s = e.substring(o + 1),
							r = ge(s, t, n, (a += 1)),
							i = Object(le.a)(r, 2),
							l = i[0],
							d = i[1];
						return [c + n + l, d];
					}
				}
				return [e, a];
			}
			var ye = (function () {
				function e(t) {
					Object(je.a)(this, e), (this.noms = void 0), (this.noms = this.filterFalsey(t));
				}
				return (
					Object(fe.a)(e, [
						{
							key: 'hasAnyNoms',
							value: function () {
								return null !== this.noms;
							},
						},
						{
							key: 'hasRedCrossOfShame',
							value: function () {
								return this.isPropertyTrue('nothing');
							},
						},
						{
							key: 'hasRunOut',
							value: function () {
								return this.isPropertyTrue('run_out');
							},
						},
						{
							key: 'hasNomsOption',
							value: function (e) {
								return this.isPropertyTrue(e);
							},
						},
						{
							key: 'hasExtraNoms',
							value: function () {
								return this.hasAnyPropertiesTrue(e.additionalFoodNomsIcons);
							},
						},
						{
							key: 'hasCoreNoms',
							value: function () {
								return this.hasAnyPropertiesTrue(e.coreNomsIcons);
							},
						},
						{
							key: 'onlyHasExtraNoms',
							value: function () {
								return !0 === this.hasExtraNoms() && !1 === this.hasCoreNoms();
							},
						},
						{
							key: 'getFoodIconNamesFromNoms',
							value: function () {
								return null === this.noms
									? []
									: Object.keys(this.noms).filter(function (t) {
											return e.foodNomsIcons.includes(t);
										});
							},
						},
						{
							key: 'onlyHasFreeText',
							value: function () {
								return (
									!1 === this.hasCoreNoms() &&
									!1 === this.hasExtraNoms() &&
									null !== this.noms &&
									!0 === this.noms.free_text
								);
							},
						},
						{
							key: 'getIconForNoms',
							value: function (e) {
								var t = this.hasExtraNoms();
								if (!0 === this.isPropertyTrue('nothing')) return e.red_cross_of_shame;
								if (this.hasAllPropertiesTrue(['bbq', 'cake']))
									return !0 === this.isPropertyTrue('run_out')
										? e.bbq_and_cake_run_out
										: !0 === t
											? e.bbq_and_cake_plus
											: e.bbq_and_cake;
								if (!0 === this.isPropertyTrue('bbq'))
									return !0 === this.isPropertyTrue('run_out') ? e.bbq_run_out : !0 === t ? e.bbq_plus : e.bbq;
								if (!0 === this.isPropertyTrue('cake'))
									return !0 === this.isPropertyTrue('run_out') ? e.cake_run_out : !0 === t ? e.cake_plus : e.cake;
								if (this.onlyHasExtraNoms()) {
									var n = Object.keys(this.noms)[0];
									return n in e ? e[n] : e.unknown;
								}
								return this.onlyHasFreeText() ? e.tick : null;
							},
						},
						{
							key: 'getDetailedIconsForNoms',
							value: function (e, t, n, a) {
								var o = this,
									c = 0.4,
									s = [];
								if (!0 === this.hasRedCrossOfShame()) return e.red_cross_of_shame;
								var r = this.getPrimaryIconName(),
									i = t[r];
								i.getImage().setAnchor([25.6, 25.6]), i.getImage().setScale(c), i.setZIndex(0), s.push(i);
								var l = ge(n.get('premises'), 16, '\n'),
									d = Object(le.a)(l, 2),
									p = d[0],
									u = d[1],
									m = u + 1;
								return (
									s.push(
										new pe.b({
											text: new Oe.a({
												text: p,
												font: ''.concat(16, 'px Roboto, sans-serif'),
												textAlign: 'left',
												offsetX: -8,
												offsetY: 0 === u ? -18.4 : -16 * m + 4,
												fill: new he.a({ color: '#000' }),
												stroke: new be.a({ color: '#fff', width: 3 }),
											}),
											zIndex: 10,
										}),
									),
									this.getFoodIconNamesFromNoms()
										.sort()
										.forEach(function (e, n) {
											var a = t[e];
											a.getImage().setAnchor(o.getIconAnchorPosition(n, 64, c)), a.getImage().setScale(c), s.push(a);
										}),
									s
								);
							},
						},
						{
							key: 'getPrimaryIconName',
							value: function () {
								return !0 === this.hasRunOut() ? 'run_out' : !0 === this.hasExtraNoms() ? 'plus' : 'tick';
							},
						},
						{
							key: 'getIconAnchorPosition',
							value: function (e, t, n) {
								return [t * n - t - 18 - (e % 3) * (t + 18), t * n - Math.floor(e / 3) * (t + 18)];
							},
						},
						{
							key: 'filterFalsey',
							value: function (e) {
								if (null === e) return null;
								var t = {};
								return (
									Object.entries(e).forEach(function (e) {
										var n = Object(le.a)(e, 2),
											a = n[0],
											o = n[1];
										!1 !== o && (t[a] = o);
									}),
									t
								);
							},
						},
						{
							key: 'isPropertyTrue',
							value: function (e) {
								return null !== this.noms && e in this.noms && !0 === this.noms[e];
							},
						},
						{
							key: 'hasAnyPropertiesTrue',
							value: function (e) {
								var t,
									n = Object(me.a)(e);
								try {
									for (n.s(); !(t = n.n()).done; ) {
										var a = t.value;
										if (!0 === this.isPropertyTrue(a)) return !0;
									}
								} catch (o) {
									n.e(o);
								} finally {
									n.f();
								}
								return !1;
							},
						},
						{
							key: 'hasAllPropertiesTrue',
							value: function (e) {
								var t,
									n = Object(me.a)(e);
								try {
									for (n.s(); !(t = n.n()).done; ) {
										var a = t.value;
										if (!1 === this.isPropertyTrue(a)) return !1;
									}
								} catch (o) {
									n.e(o);
								} finally {
									n.f();
								}
								return !0;
							},
						},
					]),
					e
				);
			})();
			(ye.coreNomsIcons = ['bbq', 'cake', 'nothing', 'run_out']),
				(ye.foodNomsIcons = ['bbq', 'cake', 'bacon_and_eggs', 'halal', 'vego', 'coffee']),
				(ye.additionalFoodNomsIcons = ['bacon_and_eggs', 'halal', 'vego', 'coffee']);
			var ve = 'ealgis/map/STORE_MAP_DATA',
				ze = 'ealgis/map/SEARCH_MAP',
				Ce = 'ealgis/map/GEOCODE_PLACE_RESULT',
				we = 'ealgis/map/CLEAR_MAP_SEARCH',
				_e = { search: null, geojson: {}, place: void 0 };
			function Se(e) {
				return { type: ze, searchParams: e };
			}
			function Ee() {
				return { type: we };
			}
			function ke(e) {
				return { type: Ce, place: e };
			}
			var Te = {},
				Pe = {};
			Object.entries({
				cake: { zIndex: 2, scale: 0.5 },
				cake_plus: { zIndex: 3, scale: 0.5 },
				cake_run_out: { zIndex: 1, scale: 0.5 },
				cake_tick: { zIndex: 3, scale: 0.5 },
				bbq_and_cake: { zIndex: 2, scale: 0.5 },
				bbq_and_cake_plus: { zIndex: 3, scale: 0.5 },
				bbq_and_cake_run_out: { zIndex: 1, scale: 0.5 },
				bbq_and_cake_tick: { zIndex: 3, scale: 0.5 },
				bbq: { zIndex: 2, scale: 0.5 },
				bbq_plus: { zIndex: 3, scale: 0.5 },
				bbq_run_out: { zIndex: 1, scale: 0.5 },
				bbq_tick: { zIndex: 3, scale: 0.5 },
				unknown: { zIndex: 0, scale: 1, opacity: 0.4 },
				tick: { zIndex: 2, scale: 0.5 },
				plus: { zIndex: 2, scale: 0.5 },
				run_out: { zIndex: 2, scale: 0.5 },
				red_cross_of_shame: { zIndex: 1, scale: 0.4 },
				vego: { zIndex: 0, scale: 0.5 },
				bacon_and_eggs: { zIndex: 0, scale: 0.5 },
				coffee: { zIndex: 0, scale: 0.5 },
				halal: { zIndex: 0, scale: 0.5 },
			}).forEach(function (e) {
				var t = Object(le.a)(e, 2),
					n = t[0],
					a = t[1],
					o = ue.a.find(function (e) {
						return e.filename === ''.concat(n, '.png');
					});
				if (void 0 !== o) {
					var c = {
						src: './icons/sprite_'.concat(ue.b.hash, '.png'),
						offset: [Math.abs(o.frame.x), Math.abs(o.frame.y)],
						size: [o.spriteSourceSize.w, o.spriteSourceSize.h],
						scale: a.scale,
						opacity: 'opacity' in a ? a.opacity : void 0,
					};
					(Te[n] = new pe.b({ image: new de.a(c), zIndex: a.zIndex })),
						(Pe[n] = new pe.b({
							image: new de.a(Object(v.a)(Object(v.a)({}, c), {}, { anchorXUnits: 'pixels', anchorYUnits: 'pixels' })),
							zIndex: 1,
						}));
				}
			});
			var Me = function (e) {
					return (
						Object.values(e).filter(function (e) {
							return !0 === e;
						}).length > 0
					);
				},
				Re = function (e, t) {
					return e in t && !0 === t[e];
				},
				Ae = function (e, t, n) {
					var a = new ye(e.get('noms'));
					return !0 === a.hasAnyNoms()
						? !0 === Me(n) &&
							!1 ===
								(function (e, t) {
									if (Me(t) && !0 === e.hasAnyNoms()) {
										for (var n = 0, a = Object.entries(t); n < a.length; n++) {
											var o = Object(le.a)(a[n], 2),
												c = o[0];
											if (!0 === o[1] && !1 === e.hasNomsOption(c)) return !1;
										}
										return !0;
									}
									return !0;
								})(a, n)
							? null
							: t >= 7
								? a.getIconForNoms(Te)
								: a.getDetailedIconsForNoms(Te, Pe, e, t)
						: !1 === Me(n)
							? Te.unknown
							: null;
				},
				Ie = n(50),
				Le = 'ealgis/snackbars/ADD_MESSAGE',
				Fe = 'ealgis/snackbars/START',
				Ne = 'ealgis/snackbars/NEXT',
				De = { open: !1, active: { message: '' }, messages: [] };
			function Ue() {
				return function (e) {
					return e({ type: Ne });
				};
			}
			function Ge(e) {
				return function (t) {
					return (
						t(
							(function (e) {
								return { type: Le, message: e };
							})(e),
						),
						t({ type: Fe })
					);
				};
			}
			function Be(e) {
				return function (t) {
					return t(Ge({ message: e, autoHideDuration: 2500 }));
				};
			}
			var We = 'ealgis/polling_places/LOAD',
				Ve = 'ealgis/polling_places/LOAD_TYPES',
				He = { types: [], by_election: {} };
			var qe;
			function Ye(e, t) {
				return (function () {
					var n = Object(g.a)(
						x.a.mark(function n(a, o, c) {
							var s, r, i;
							return x.a.wrap(function (n) {
								for (;;)
									switch ((n.prev = n.next)) {
										case 0:
											return (
												(n.next = 2), c.get('/0.1/polling_places/search/', a, { election_id: e.id, ids: t.join(',') })
											);
										case 2:
											if (((s = n.sent), (r = s.response), (i = s.json), 200 !== r.status)) {
												n.next = 7;
												break;
											}
											return n.abrupt('return', i);
										case 7:
										case 'end':
											return n.stop();
									}
							}, n);
						}),
					);
					return function (e, t, a) {
						return n.apply(this, arguments);
					};
				})();
			}
			function Ke(e, t, n) {
				return (function () {
					var a = Object(g.a)(
						x.a.mark(function a(o, c, s) {
							var r, i, l;
							return x.a.wrap(function (a) {
								for (;;)
									switch ((a.prev = a.next)) {
										case 0:
											return (
												(a.next = 2),
												s.get('/0.1/polling_places/nearby/', o, {
													election_id: e.id,
													lonlat: ''.concat(n, ',').concat(t),
												})
											);
										case 2:
											if (((r = a.sent), (i = r.response), (l = r.json), 200 !== i.status)) {
												a.next = 7;
												break;
											}
											return a.abrupt('return', l);
										case 7:
										case 'end':
											return a.stop();
									}
							}, a);
						}),
					);
					return function (e, t, n) {
						return a.apply(this, arguments);
					};
				})();
			}
			function Qe(e, t, n) {
				return (function () {
					var a = Object(g.a)(
						x.a.mark(function a(o, c, s) {
							var r, i, l;
							return x.a.wrap(function (a) {
								for (;;)
									switch ((a.prev = a.next)) {
										case 0:
											return (
												(a.next = 2),
												s.get('/0.1/polling_places/nearby_bbox/', o, {
													election_id: e.id,
													lonlat: ''.concat(n, ',').concat(t),
												})
											);
										case 2:
											if (((r = a.sent), (i = r.response), (l = r.json), 200 !== i.status)) {
												a.next = 10;
												break;
											}
											if (null === l.extent_wgs84) {
												a.next = 8;
												break;
											}
											return a.abrupt('return', l.extent_wgs84);
										case 8:
											return o(Be("There aren't any polling places near here :(")), a.abrupt('return', null);
										case 10:
										case 'end':
											return a.stop();
									}
							}, a);
						}),
					);
					return function (e, t, n) {
						return a.apply(this, arguments);
					};
				})();
			}
			function Xe(e, t, n, a) {
				return (function () {
					var o = Object(g.a)(
						x.a.mark(function o(c, s, r) {
							var i, l, d;
							return x.a.wrap(function (o) {
								for (;;)
									switch ((o.prev = o.next)) {
										case 0:
											return (
												(o.next = 2),
												r.get('/0.1/polling_places/lookup/', c, { election_id: e.id, name: t, premises: n, state: a })
											);
										case 2:
											if (((i = o.sent), (l = i.response), (d = i.json), 200 !== l.status)) {
												o.next = 7;
												break;
											}
											return o.abrupt('return', d);
										case 7:
											return o.abrupt('return', null);
										case 8:
										case 'end':
											return o.stop();
									}
							}, o);
						}),
					);
					return function (e, t, n) {
						return o.apply(this, arguments);
					};
				})();
			}
			function Je(e, t) {
				return (function () {
					var n = Object(g.a)(
						x.a.mark(function n(a, o, c) {
							var s, r, i;
							return x.a.wrap(function (n) {
								for (;;)
									switch ((n.prev = n.next)) {
										case 0:
											return (n.next = 2), c.get('/0.1/polling_places/lookup/', a, { election_id: e.id, ec_id: t });
										case 2:
											if (((s = n.sent), (r = s.response), (i = s.json), 200 !== r.status)) {
												n.next = 7;
												break;
											}
											return n.abrupt('return', i);
										case 7:
											return n.abrupt('return', null);
										case 8:
										case 'end':
											return n.stop();
									}
							}, n);
						}),
					);
					return function (e, t, a) {
						return n.apply(this, arguments);
					};
				})();
			}
			function Ze(e, t) {
				return (function () {
					var n = Object(g.a)(
						x.a.mark(function n(a, o, c) {
							var s, r, i;
							return x.a.wrap(function (n) {
								for (;;)
									switch ((n.prev = n.next)) {
										case 0:
											return (
												(n.next = 2), c.get('/0.1/polling_places/stall_lookup/', a, { election_id: e.id, stall_id: t })
											);
										case 2:
											if (((s = n.sent), (r = s.response), (i = s.json), 200 !== r.status)) {
												n.next = 7;
												break;
											}
											return n.abrupt('return', i);
										case 7:
											return n.abrupt('return', null);
										case 8:
										case 'end':
											return n.stop();
									}
							}, n);
						}),
					);
					return function (e, t, a) {
						return n.apply(this, arguments);
					};
				})();
			}
			!(function (e) {
				(e[(e.NO_IDEA = 0)] = 'NO_IDEA'),
					(e[(e.UNLIKELY = 1)] = 'UNLIKELY'),
					(e[(e.MIXED = 2)] = 'MIXED'),
					(e[(e.FAIR = 3)] = 'FAIR'),
					(e[(e.STRONG = 4)] = 'STRONG');
			})(qe || (qe = {}));
			function $e(e) {
				if (null === e.stall || null === e.stall.noms) return !1;
				for (var t = 0, n = Object.entries(e.stall.noms); t < n.length; t++) {
					var a = Object(le.a)(n[t], 2),
						o = a[0],
						c = a[1];
					if ('free_text' !== o) {
						if (!0 === c) return !0;
					} else if ('' !== c) return !0;
				}
				return !1;
			}
			function et(e) {
				if (null === e.stall || null === e.stall.noms) return !1;
				for (var t = 0, n = Object.entries(e.stall.noms); t < n.length; t++) {
					var a = Object(le.a)(n[t], 2),
						o = a[0],
						c = a[1];
					if ('run_out' !== o && 'nothing' !== o)
						if ('free_text' !== o) {
							if (!0 === c) return !0;
						} else if ('' !== c) return !0;
				}
				return !1;
			}
			function tt(e) {
				switch (e.chance_of_sausage) {
					case qe.STRONG:
						return Ie.purple600;
					case qe.FAIR:
						return Ie.purple500;
					case qe.MIXED:
						return Ie.purple400;
					case qe.UNLIKELY:
						return Ie.purple300;
					case qe.NO_IDEA:
					default:
						return Ie.purple200;
				}
			}
			function nt(e) {
				switch (e.chance_of_sausage) {
					case qe.STRONG:
						return 'Based on past elections this booth has a STRONG chance of having food.';
					case qe.FAIR:
						return 'Based on past elections this booth has a FAIR chance of having food.';
					case qe.MIXED:
						return 'Based on past elections this booth has a MIXED chance of having food.';
					case qe.UNLIKELY:
						return 'Based on past elections this booth is UNLIKELY to have food.';
					case qe.NO_IDEA:
					default:
						return 'We have never had reports from this booth. Let us know what you find!';
				}
			}
			function at(e) {
				return !(
					'' === e.wheelchair_access ||
					'None' === e.wheelchair_access ||
					'No wheelchair access' === e.wheelchair_access ||
					'No Access' === e.wheelchair_access ||
					null === e.wheelchair_access
				);
			}
			function ot(e) {
				return !0 === at(e) ? e.wheelchair_access : 'None';
			}
			function ct(e) {
				return '' !== e.entrance_desc;
			}
			function st(e) {
				return !0 === ct(e)
					? e.entrance_desc.startsWith('Entrance to polling place: ')
						? e.entrance_desc.slice('Entrance to polling place: '.length)
						: e.entrance_desc
					: 'No information supplied';
			}
			var rt,
				it = {};
			function lt(e) {
				return (function () {
					var t = Object(g.a)(
						x.a.mark(function t(n, a, o) {
							return x.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.post('/0.1/stalls/', e, n);
										case 2:
											return t.abrupt('return', t.sent);
										case 3:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, a) {
						return t.apply(this, arguments);
					};
				})();
			}
			function dt(e, t, n, a) {
				return (function () {
					var o = Object(g.a)(
						x.a.mark(function o(c, s, r) {
							return x.a.wrap(function (o) {
								for (;;)
									switch ((o.prev = o.next)) {
										case 0:
											return (
												(o.next = 2),
												r.patch(
													'/0.1/stalls/'.concat(e, '/update_and_resubmit/'),
													Object(v.a)(Object(v.a)({}, t), { token: n, signature: a }),
													c,
												)
											);
										case 2:
											return o.abrupt('return', o.sent);
										case 3:
										case 'end':
											return o.stop();
									}
							}, o);
						}),
					);
					return function (e, t, n) {
						return o.apply(this, arguments);
					};
				})();
			}
			!(function (e) {
				(e.PENDING = 'Pending'), (e.APPROVED = 'Approved'), (e.DECLINED = 'Declined');
			})(rt || (rt = {}));
			var pt = function (e) {
					return null !== e.polling_place
						? e.polling_place.premises
						: null !== e.location_info
							? e.location_info.name
							: "Error: Couldn't get stall location name";
				},
				ut = function (e) {
					return null !== e.polling_place
						? e.polling_place.address
						: null !== e.location_info
							? e.location_info.address
							: "Error: Couldn't get stall location address";
				},
				mt = m.a,
				jt = i.combineReducers({
					app: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ne,
							t = arguments.length > 1 ? arguments[1] : void 0,
							n = y.get(e, 'requestsInProgress');
						switch (t.type) {
							case Y:
								return y.set(e, 'loading', !0);
							case K:
								return y.set(e, 'loading', !1);
							case Q:
								return y.set(e, 'requestsInProgress', (n += 1));
							case X:
								return y.set(e, 'requestsInProgress', (n -= 1));
							case J:
								return y.set(e, 'previousPath', t.previousPath);
							case Z:
								return y.toggle(e, 'sidebarOpen');
							case $:
								var a = y.get(e, 'modals');
								return a.set(t.modalId, !a.get(t.modalId)), y.set(e, 'modals', a);
							case ee:
								return y.set(e, 'pollingPlaceFinderMode', t.pollingPlaceFinderMode);
							case te:
								return y.set(e, 'embedded_map', t.embedded_map);
							default:
								return e;
						}
					},
					snackbars: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : De,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case Le:
								return e.messages.push(t.message), y.set(e, 'messages', e.messages);
							case Fe:
								if (!1 === e.open && e.messages.length > 0) {
									var n = e.messages.shift();
									(e = y.set(e, 'messages', e.messages)), (e = y.set(e, 'active', n)), (e = y.set(e, 'open', !0));
								}
								return e;
							case Ne:
								if (e.messages.length > 0) {
									var a = e.messages.shift();
									return (e = y.set(e, 'messages', e.messages)), (e = y.set(e, 'active', a)), y.set(e, 'open', !0);
								}
								return (e = y.set(e, 'active', { message: '' })), y.set(e, 'open', !1);
							default:
								return e;
						}
					},
					elections: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : M,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case S:
								return y.set(e, 'elections', t.elections);
							case E:
								var n = e.elections.findIndex(function (e) {
									return e.id === t.election.id;
								});
								return -1 === n
									? y.set(e, 'elections', [t.election].concat(Object(z.a)(e.elections)))
									: y.set(
											e,
											'elections.'.concat(n),
											Object(v.a)(Object(v.a)({}, y.get(e, 'elections.'.concat(n))), t.election),
										);
							case k:
								return y.set(e, 'current_election_id', t.electionId);
							case T:
								return y.set(e, 'default_election_id', t.electionId);
							case P:
								return (
									e.elections.forEach(function (n, a) {
										e = y.set(e, 'elections.'.concat(a, '.is_primary'), n.id === t.electionId);
									}),
									e
								);
							default:
								return e;
						}
					},
					polling_places: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : He,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case We:
								return y.set(e, 'by_election.'.concat(t.election.id), t.pollingPlaces);
							case Ve:
								return y.set(e, 'types', t.pollingPlaceTypes);
							default:
								return e;
						}
					},
					stalls: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : it,
							t = arguments.length > 1 ? arguments[1] : void 0;
						return t.type, e;
					},
					map: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : _e,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case ve:
								return y.set(e, 'geojson.'.concat(t.electionId), t.geojson);
							case ze:
								return y.set(e, 'search', t.searchParams);
							case we:
								return y.set(e, 'search', null);
							case Ce:
								return y.set(e, 'place', t.place);
							default:
								return e;
						}
					},
					routing: r.routerReducer,
					form: mt.plugin({
						pollingPlace: function (e, t) {
							switch (t.type) {
								case 'ealgis/polling_places/VALIDATION_ERRORS':
									return (e = y.set(e, 'submitSucceeded', !1)), y.merge(e, 'syncErrors', t.errors);
								default:
									return e;
							}
						},
					}),
					browser: d.a,
					responsiveDrawer: u.d,
					sausageApi: re.reducer,
				}),
				ft = n(155),
				ht = function (e) {
					return (
						ft.b(function (t) {
							var n = JSON.parse(JSON.stringify(e.getState()));
							return (
								'map' in n && 'geojson' in n.map && (n.map.geojson = Object.keys(n.map.geojson)),
								Object(v.a)(
									Object(v.a)({}, t),
									{},
									{ extra: Object(v.a)(Object(v.a)({}, t.extra), {}, { 'redux:state': n }) },
								)
							);
						}),
						function (e) {
							return function (t) {
								return b.a({ category: 'redux-action', message: t.type }), e(t);
							};
						}
					);
				},
				bt = function (e) {
					e &&
						e instanceof Function &&
						n
							.e(3)
							.then(n.bind(null, 2380))
							.then(function (t) {
								var n = t.getCLS,
									a = t.getFID,
									o = t.getFCP,
									c = t.getLCP,
									s = t.getTTFB;
								n(e), a(e), o(e), c(e), s(e);
							});
				},
				Ot = n(29),
				xt = n(8),
				gt = n(9),
				yt = n(0),
				vt = n.n(yt),
				zt = n(124),
				Ct = n(12),
				wt = n(13),
				_t = n(804),
				St = n(805),
				Et = n(806),
				kt = n(232),
				Tt = n(240),
				Pt = n(23),
				Mt = n(193),
				Rt = n(31),
				At = n(800),
				It = n(801),
				Lt = n(112),
				Ft = n(819),
				Nt = n.n(Ft),
				Dt = n(2),
				Ut = n.n(Dt),
				Gt = n(85),
				Bt = n(1),
				Wt = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								className: 'disabled' in e && !0 === e.disabled ? 'greyscale' : void 0,
								children: Object(Bt.jsxs)('svg', {
									viewBox: '0 0 512 512',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.414',
									children: [
										Object(Bt.jsx)('path', {
											d: 'M141.92 42.268c-11.533 8.477-22.334 18.201-30.437 30.001-7.63 11.112-12.675 23.768-17.261 36.443-10.556 29.172-19.058 61.053-10.579 90.896 5.623 19.79 18.192 36.714 28.836 54.32 10.644 17.606 19.778 37.607 17.3 58.03-1.686 13.895 1.053 68.123 105.575 94.685 51.738 13.148 107.576 15.511 156.664-5.465 49.088-20.976 89.636-62.667 106.092-113.45 4.209-12.988 6.888-26.619 6.219-40.256a84.143 84.143 0 0 0-9.735-35.287c-6.412-12.041-16.025-23.347-16.418-36.983-.192-6.646 1.887-13.114 3.225-19.627 7.017-34.164-7.086-70.345-30.864-95.86-23.778-25.516-55.089-45.587-89.314-52.3C273.687-9.759 194.899 3.327 141.92 42.268z',
											fill: '#f9e8d4',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('circle', { cx: '341.672', cy: '207.965', r: '86.057', fill: '#fec007' }),
										Object(Bt.jsx)('path', {
											d: 'M498.105 287.73c-16.448 50.776-57.001 92.47-106.092 113.448-12.341 5.277-25.105 9.071-38.132 11.594-38.768 7.507-79.796 3.703-118.523-6.135-104.528-26.558-107.262-80.785-105.577-94.68 2.472-20.423-6.66-40.423-17.305-58.031-10.635-17.608-23.208-34.53-28.829-54.317-5.146-18.113-4.046-36.982-.01-55.528 2.603-12.018 6.438-23.904 10.585-35.367 4.591-12.674 9.637-25.337 17.265-36.447 8.103-11.796 18.9-21.523 30.433-29.999C194.894 3.328 273.692-9.759 361.227 7.415c34.217 6.71 65.528 26.78 89.311 52.299 23.773 25.519 37.88 61.694 30.867 95.86-1.342 6.508-3.421 12.976-3.229 19.626.394 13.632 10.01 24.944 16.417 36.982a84.195 84.195 0 0 1 9.737 35.287c.667 13.642-2.007 27.274-6.225 40.261z',
											fill: '#f9e8d4',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M353.881 412.772c-38.768 7.507-79.796 3.703-118.523-6.135-104.528-26.558-107.262-80.785-105.577-94.68 2.472-20.423-6.66-40.423-17.305-58.031-10.635-17.608-23.208-34.53-28.829-54.317-5.146-18.113-4.046-36.982-.01-55.528l9.223 3.764c9.041 3.683 17.729 9.536 25.115 16.932 7.386 7.386 13.239 16.064 16.922 25.105 2.179 5.338 5.741 10.575 10.302 15.146 4.561 4.551 9.798 8.113 15.136 10.292 9.041 3.683 17.729 9.536 25.115 16.932 7.386 7.386 13.239 16.064 16.922 25.105 2.18 5.338 5.742 10.575 10.303 15.136 4.561 4.561 9.798 8.123 15.136 10.302 9.041 3.683 17.729 9.536 25.115 16.932 7.386 7.376 13.239 16.064 16.922 25.105 2.18 5.338 5.741 10.575 10.302 15.136 4.571 4.571 9.798 8.123 15.126 10.292 9.051 3.693 17.729 9.546 25.126 16.942 7.396 7.386 13.249 16.074 16.922 25.115 2.18 5.328 5.742 10.565 10.303 15.126a50.289 50.289 0 0 0 6.254 5.329z',
											fill: '#efcdb1',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('circle', { cx: '341.672', cy: '207.965', r: '104.013', fill: '#efcdb1' }),
										Object(Bt.jsx)('path', {
											d: 'M498.105 287.73c-16.448 50.776-57.001 92.47-106.092 113.448-30.171 12.896-62.904 16.972-95.658 15.136 26.619-.373 52.905-5.035 77.495-15.539 49.09-20.978 89.644-62.662 106.092-113.448 4.218-12.987 6.892-26.619 6.226-40.261a84.218 84.218 0 0 0-9.737-35.287c-6.407-12.038-16.024-23.339-16.417-36.982-.192-6.64 1.887-13.108 3.229-19.626 7.013-34.167-7.094-70.341-30.867-95.86-23.783-25.509-55.094-45.589-89.311-52.299C323.6 3.198 304.57.867 286.164.009c23.965-.111 49.131 2.321 75.064 7.406 34.217 6.71 65.528 26.78 89.311 52.299 23.773 25.519 37.88 61.694 30.867 95.86-1.342 6.508-3.421 12.976-3.229 19.626.394 13.632 10.01 24.944 16.417 36.982a84.195 84.195 0 0 1 9.737 35.287c.666 13.642-2.008 27.274-6.226 40.261z',
											fill: '#efcdb1',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('circle', { cx: '341.672', cy: '207.965', r: '86.057', fill: '#fec007' }),
										Object(Bt.jsx)('circle', { cx: '328.918', cy: '182.712', r: '28.814', fill: '#f9de69' }),
										Object(Bt.jsx)('path', {
											d: 'M376.06 75.478a7.751 7.751 0 0 1-7.752-7.752v-1.664a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.664a7.751 7.751 0 0 1-7.752 7.752zM186.358 153.513a7.751 7.751 0 0 1-7.752-7.752v-1.664a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.664a7.751 7.751 0 0 1-7.752 7.752zM395.297 89.765a7.751 7.751 0 0 1-7.752-7.752v-1.664a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.664a7.75 7.75 0 0 1-7.752 7.752zM219.657 152.681a7.751 7.751 0 0 1-7.752-7.752v-1.665a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.665a7.751 7.751 0 0 1-7.752 7.752zM213.602 241.01a7.751 7.751 0 0 1-7.752-7.752v-1.664a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.664a7.751 7.751 0 0 1-7.752 7.752zM232.775 73.16a7.751 7.751 0 0 1-7.752-7.752v-1.664a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.664a7.751 7.751 0 0 1-7.752 7.752zM413.395 312.81a7.751 7.751 0 0 1-7.752-7.752v-1.664a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.664a7.751 7.751 0 0 1-7.752 7.752zM395.297 342.073a7.751 7.751 0 0 1-7.752-7.752v-1.664a7.751 7.751 0 0 1 7.752-7.752 7.751 7.751 0 0 1 7.752 7.752v1.664a7.75 7.75 0 0 1-7.752 7.752z',
											fill: '#efcdb1',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsxs)('g', {
											fillRule: 'nonzero',
											children: [
												Object(Bt.jsx)('path', {
													d: 'M296.1 458.486c-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766L9.966 232.943c-3.673 3.673-3.047 9.824 1.334 12.614 3.871 2.465 7.641 5.474 11.169 9.001 6.274 6.274 10.909 13.322 13.761 20.344 2.859 7.014 7.494 14.063 13.775 20.344 6.274 6.274 13.322 10.909 20.337 13.768 7.021 2.852 14.07 7.487 20.35 13.768 6.274 6.274 10.909 13.322 13.761 20.344 2.859 7.014 7.494 14.063 13.775 20.344 6.274 6.274 13.322 10.909 20.337 13.768 7.021 2.852 14.07 7.487 20.351 13.768 6.274 6.274 10.909 13.322 13.761 20.344 2.859 7.014 7.494 14.063 13.775 20.344 6.274 6.274 13.329 10.916 20.337 13.768 7.021 2.852 14.07 7.487 20.351 13.768 6.274 6.274 10.916 13.329 13.761 20.344 2.859 7.014 7.494 14.063 13.775 20.344 4.577 4.577 9.571 8.286 14.658 11.065 3.202 1.749 7.167 1.216 9.747-1.364l37.365-37.365c-7.014-2.857-14.069-7.491-20.346-13.768z',
													fill: '#fb4239',
												}),
												Object(Bt.jsx)('path', {
													d: 'M315.025 473.673c-7.294-2.573-14.513-7.045-20.79-13.322-6.277-6.277-10.748-13.496-13.322-20.79-2.574-7.294-7.045-14.513-13.322-20.79-6.277-6.277-13.496-10.748-20.79-13.322-7.294-2.573-14.513-7.044-20.79-13.322-6.277-6.277-10.748-13.496-13.322-20.79-2.574-7.294-7.045-14.513-13.322-20.79-6.277-6.277-13.496-10.748-20.79-13.322-7.294-2.573-14.513-7.045-20.79-13.322-6.277-6.277-10.748-13.496-13.322-20.79-2.574-7.294-7.045-14.513-13.322-20.79-6.277-6.277-13.496-10.748-20.79-13.322-7.294-2.573-14.513-7.045-20.79-13.322-6.277-6.277-10.748-13.496-13.322-20.79-2.574-7.294-7.045-14.513-13.322-20.79-6.277-6.277-13.496-10.748-20.79-13.322l23.852-23.852c7.294 2.573 14.513 7.045 20.79 13.322 6.277 6.277 10.748 13.496 13.322 20.79 2.574 7.294 7.045 14.513 13.322 20.79 6.277 6.277 13.496 10.748 20.79 13.322 7.294 2.573 14.513 7.045 20.79 13.322 6.277 6.277 10.748 13.496 13.322 20.79 2.574 7.294 7.045 14.513 13.322 20.79 6.277 6.277 13.496 10.748 20.79 13.322 7.294 2.574 14.513 7.045 20.79 13.322 6.277 6.277 10.748 13.496 13.322 20.79 2.574 7.294 7.045 14.513 13.322 20.79 6.277 6.277 13.496 10.748 20.79 13.322 7.294 2.573 14.513 7.045 20.79 13.322 6.277 6.277 10.748 13.496 13.322 20.79 2.574 7.294 7.045 14.513 13.322 20.79 6.277 6.277 13.496 10.748 20.79 13.322l-23.852 23.852z',
													fill: '#f9e8d4',
												}),
												Object(Bt.jsx)('path', {
													d: 'M348.693 426.052c-3.87-2.464-7.64-5.469-11.163-8.991-6.281-6.281-10.909-13.336-13.768-20.351-2.852-7.007-7.487-14.07-13.761-20.344-6.281-6.281-13.336-10.909-20.35-13.768-7.007-2.852-14.07-7.487-20.344-13.761-6.281-6.281-10.909-13.336-13.768-20.35-2.859-7.014-7.487-14.07-13.761-20.344-6.281-6.281-13.336-10.909-20.351-13.768-7.014-2.859-14.07-7.487-20.344-13.761-6.281-6.281-10.909-13.336-13.768-20.35-2.859-7.014-7.487-14.07-13.761-20.344-6.281-6.281-13.336-10.909-20.35-13.768-7.014-2.859-14.07-7.487-20.344-13.761-6.281-6.281-10.909-13.336-13.768-20.351-2.859-7.014-7.487-14.07-13.761-20.344-4.584-4.584-9.581-8.288-14.674-11.067-3.202-1.747-7.165-1.213-9.744 1.366l-16.352 16.352c7.013 2.855 14.068 7.489 20.345 13.767 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.767 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.332 10.911 20.344 13.766l12.574-12.574c3.68-3.668 3.053-9.82-1.33-12.61z',
													fill: '#fb4239',
												}),
												Object(Bt.jsx)('g', {
													fill: '#e21717',
													children: Object(Bt.jsx)('path', {
														d: 'M296.1 458.486c-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766L32.39 210.518l-21.029 21.029 5.67 2.311c5.485 2.235 10.854 5.89 15.551 10.587 4.69 4.69 8.344 10.059 10.58 15.544 3.682 9.03 9.544 17.731 16.95 25.136 7.412 7.412 16.113 13.274 25.15 16.963 5.478 2.228 10.847 5.883 15.544 10.58 4.69 4.69 8.344 10.059 10.58 15.544 3.682 9.03 9.544 17.731 16.956 25.143 7.412 7.412 16.106 13.268 25.143 16.956 5.478 2.228 10.847 5.883 15.544 10.58 4.69 4.69 8.344 10.059 10.58 15.544 3.682 9.03 9.544 17.731 16.956 25.143 7.412 7.412 16.106 13.268 25.143 16.956 5.478 2.228 10.847 5.883 15.544 10.58 4.69 4.69 8.351 10.066 10.58 15.544 3.682 9.03 9.545 17.731 16.956 25.143 5.904 5.904 12.616 10.82 19.672 14.433l21.029-21.029 10.955-10.955c-7.012-2.853-14.067-7.487-20.344-13.764zM84.907 192.114c6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.767 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.332 10.911 20.344 13.766l11.156-11.156-5.67-2.311c-5.478-2.228-10.854-5.89-15.544-10.58-4.697-4.697-8.352-10.066-10.58-15.544-3.682-9.044-9.538-17.738-16.95-25.15-7.412-7.412-16.113-13.274-25.15-16.95-5.478-2.228-10.854-5.89-15.544-10.58-4.697-4.697-8.351-10.066-10.58-15.544-3.682-9.044-9.538-17.738-16.95-25.15-7.412-7.412-16.113-13.274-25.15-16.95-5.485-2.235-10.854-5.89-15.544-10.58-4.697-4.697-8.351-10.066-10.58-15.544-3.682-9.044-9.538-17.738-16.95-25.15-7.412-7.412-16.113-13.274-25.15-16.95-5.485-2.235-10.854-5.89-15.551-10.587-4.69-4.69-8.344-10.059-10.58-15.544-3.675-9.037-9.538-17.738-16.943-25.143-5.904-5.904-12.623-10.827-19.679-14.44L64.554 178.34c7.02 2.862 14.076 7.497 20.353 13.774z',
													}),
												}),
												Object(Bt.jsx)('path', {
													d: 'M295.416 493.282c-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.012-2.854-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766-7.013-2.855-14.068-7.489-20.345-13.766-6.277-6.277-10.912-13.332-13.766-20.345-2.855-7.013-7.489-14.068-13.766-20.345-6.277-6.277-13.333-10.912-20.345-13.766l21.01-21.01c7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766 7.013 2.855 14.068 7.489 20.345 13.766 6.277 6.277 10.912 13.332 13.766 20.345 2.855 7.013 7.489 14.068 13.766 20.345 6.277 6.277 13.333 10.912 20.345 13.766l-21.01 21.01z',
													fill: '#ff8859',
												}),
											],
										}),
									],
								}),
							},
						),
					);
				});
			(Wt.displayName = 'BaconandEggsIcon'), (Wt.muiName = 'SvgIcon');
			var Vt = Wt,
				Ht = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								className: 'disabled' in e && !0 === e.disabled ? 'greyscale' : void 0,
								children: Object(Bt.jsxs)('svg', {
									viewBox: '0 0 427 495',
									xmlns: 'http://www.w3.org/2000/svg',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.414',
									children: [
										Object(Bt.jsx)('path', {
											d: 'M8.26 399.72c0 48.162 92.167 87.201 205.44 87.201 113.28 0 205.11-39.039 205.11-87.201V227.31H8.26v172.41z',
											fill: 'url(#_Radial1)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M4.741 217.33c0 5.598-11.26 34.952 3.647 34.952 9.034 0 5.387-11.854 13.25-2.996 27.498 30.954 35.435 85.56 64.271 112.5 13.741 12.84 32.331 8.335 48.197 15.977 23.843 11.475 16.089 48.591 47.394 48.591 27.33 0 18.203-51.088 45.034-51.088 28.29 0 30.412 34.449 49.2 34.449 24.347 0 12.977-56.833 37.269-79.881 35.774-33.949 63.386-10.738 58.136 9.486-5.96 22.965 1.903 42.436 12.922 42.436 17.392 0 13.327-34.171 12.423-43.435-2.484-25.462 9.423-42.924 18.886-50.425 14.506-11.498 10.929-56.36 10.929-70.145 0-46.735-70.769-92.947-213.88-92.947-148.42-.01-207.68 45.78-207.68 92.52l.002.006z',
											fill: 'url(#_Radial2)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M4.075 209.34c0 5.597-11.257 34.951 3.65 34.951 9.03 0 5.387-11.854 13.254-2.995 27.498 30.953 35.427 85.56 64.267 112.5 13.737 12.841 32.331 8.336 48.193 15.977 23.847 11.475 16.405 49.925 47.706 49.925 27.33 0 17.891-52.421 44.722-52.421 28.29 0 30.412 34.448 49.204 34.448 24.347 0 12.973-56.833 37.269-79.881 35.771-33.949 63.382-10.737 58.132 9.486-5.956 22.966 1.907 42.437 12.922 42.437 17.392 0 13.332-34.172 12.423-43.436-2.484-25.462 9.419-42.924 18.89-50.424 14.502-11.499 10.925-56.361 10.925-70.146 0-46.735-70.765-92.947-213.88-92.947-148.4-.01-207.66 45.78-207.66 92.52l-.017.006z',
											fill: 'url(#_Radial3)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M331.9 158.08c0 22.794-53.946 41.274-120.49 41.274-66.545 0-120.49-18.48-120.49-41.274 0-22.79 53.947-41.27 120.49-41.27 66.54 0 120.49 18.48 120.49 41.27z',
											fill: 'url(#_Radial4)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M295.66 97.503s7.321-27.623-11.65-33.278c-18.972-5.663-93.192-7.656-98.852 0-5.66 7.653 110.5 33.278 110.5 33.278h.002z',
											fill: 'url(#_Radial5)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M185.49 46.58s-80.239 19.51-90.197 65.238c-10.652 48.927 24.295 64.567 129.81 81.877 37.58 6.16-39.61-147.12-39.61-147.12l-.003.005z',
											fill: 'url(#_Radial6)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M184.83 55.239s-61.24 9.649-62.906 48.927c-1.666 39.269 37.276 70.223 58.245 76.214 20.968 5.991 27.955-9.985 25.294-34.948-2.65-24.96-20.62-90.191-20.62-90.191l-.013-.002z',
											fill: 'url(#_Radial7)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M179.84 53.242s-51.922 11.646-51.922 46.259c0 34.62 33.614 42.272 47.261 44.933 13.647 2.668 56.583 24.635 56.583 35.283s.332 13.316.332 13.316 29.292-25.633 36.613-26.296c7.33-.66-88.86-113.49-88.86-113.49l-.007-.005z',
											fill: 'url(#_Radial8)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M246.53 26.727c13.117 15.231 16.924 33.044 9.618 46.005-10.028 17.782-44.168 31.277-72.337 16.932-21.203-10.785-22.888-40.86-12.548-58.463 12.115-20.621 35.802-36.738 53.314-29.397 12.32 5.136 13.35 14.922 21.96 24.923h-.007z',
											fill: 'url(#_Radial9)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M238.64 16.391s-9.412-11.253-15.103-8.932c-4.517 1.833 4.642 12.282 6.985 16.444 2.345 4.169 18.539 25.068 23.621 22.946 5.08-2.126-9.73-20.832-15.5-30.458h-.003z',
											fill: 'url(#_Radial10)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M248.36 36.715c-1.607 5.188-6.826-1.739-10.192-4.435-5.753-4.638-8.218-11.639-6.81-13.402 1.673-2.106 4.688-1.58 9.295 3.741 5.42 6.245 8.84 10.462 7.7 14.096h.007z',
											fill: 'url(#_Radial11)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M183.81 89.664c28.169 14.346 62.309.851 72.337-16.932 1.618-2.875 2.605-6.011 3.147-9.279-1.42-3.639-2.972-7.126-4.419-9.302-4.81-7.146-8.765-9.154-8.765-9.154s5.52 14.95-9.317 19.058c-13.784 3.818-52.82 18.566-71.557-5.305.88 12.64 6.63 24.841 18.57 30.914h.004z',
											fill: 'url(#_Radial12)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M182.23 27.105c7.216-7.239 29.378-19.76 32.007-23.878 1.104-1.732 4.458-2.215 8.008-2.208-17.232-5.086-39.402 10.445-50.986 30.181-3.783 6.456-5.94 14.588-6.127 22.822 1.78-3.464 10.63-20.431 17.1-26.917h-.002z',
											fill: 'url(#_Radial13)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M201.72 24.141s4.825-6.482 13.426-1.361c8.601 5.118 14.291 11.982 14.942 16.042.663 4.049-8.156.8-13.675-3.491-5.53-4.294-16.32-7.06-14.7-11.19h.007z',
											fill: 'url(#_Radial14)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M209.38 23.322s7.328 1.751 9.298 4.24c1.946 2.469 5.789 6.167 4.688 7.333-1.1 1.186-7.41-4.505-8-4.801-.6-.309-14.67-3.504-5.99-6.772h.004z',
											fill: 'url(#_Radial15)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M175.51 63.554s-16.308 16.312-16.308 40.607c0 24.295 21.304 34.281 36.613 34.281 15.31 0 36.941 4.329 47.593 14.314 10.652 9.985 16.636 16.975 32.615 19.303 15.98 2.328 36.286 3.662 37.616-4.989 1.33-8.65-138.13-103.51-138.13-103.51l.001-.006z',
											fill: 'url(#_Radial16)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M271.7 132.46c21.102 13 48.104 10.344 57.582 12.649 0 0 15.309-21.639 6.989-34.62-8.319-12.98-27.295-20.964-40.938-22.294-13.644-1.334-43.603-11.651-57.913-16.975-14.311-5.328-32.615 2.325-35.279 9.314-2.664 6.99-5.324 15.976-5.324 15.976s41.93 15.639 74.88 35.949l.003.001z',
											fill: 'url(#_Radial17)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M177.18 67.221s-7.653 19.97 14.646 27.958c22.298 7.988 57.25 16.304 71.892 33.278 14.643 16.975 43.604 49.925 51.923 41.274 8.319-8.651 28.621-27.288 13.644-32.951-14.978-5.656-51.923-1.662-63.904-13.979-11.982-12.318-22.638-16.312-41.274-21.967-18.65-5.651-33.62-8.647-46.93-33.609l.003-.004z',
											fill: 'url(#_Radial18)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M216.32 448.31c95.486 0 176.26-22.213 203.01-52.776-.012 4.481-.02 8.577-.02 12.174 0 48.162-92.097 87.201-205.69 87.201-113.6 0-205.7-39.039-205.7-87.201 0-6.771-.008-13.297-.016-19.76 19.191 34.42 105.2 60.37 208.42 60.37l-.004-.008z',
											fill: 'url(#_Radial19)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M373.38 160.06c19.214 10.239 30.412 22.432 30.412 35.537 0 36.16-84.939 65.472-189.72 65.472-100.77 0-183.16-27.123-189.3-61.369-.246 1.428-.41 2.863-.41 4.314 0 38.603 87.923 69.896 196.37 69.896s196.37-31.293 196.37-69.896c0-16.65-16.39-31.94-43.72-43.95l-.002-.004z',
											fill: 'url(#_Radial20)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M313.26 304.86s69.896-47.928 73.89 26.96c-9.99-15.97-7.99-42.93-73.89-26.96z',
											fill: 'url(#_Radial21)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M392.14 338.81s-.5 21.468-6.99 30.954c14.98.01 6.99-30.95 6.99-30.95v-.004z',
											fill: 'url(#_Radial22)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M338.1 152.22c.09 1.311.137 2.625.137 3.947 0 40.923-49.211 89.71-103.86 90.786 37.943 6.989 158.94-15.976 158.94-54.34 0-17.63-22.45-32.89-55.22-40.4l.003.007z',
											fill: 'url(#_Radial23)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M304.77 324.09s-17.474 22.217-17.474 47.679c0 25.462-11.482 29.456-18.972 18.972 11.65-.336 12.649-10.149 12.649-20.634 0-10.485.83-34.88 23.79-46.02l.007.003z',
											fill: 'url(#_Radial24)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M226.72 362.12s-17.31.663-23.964 18.301c-6.654 17.645-17.642 48.264-35.946 26.632 14.646 4.321 19.643-5.001 27.295-20.306 7.66-15.31 13.32-25.96 32.62-24.62l-.005-.007z',
											fill: 'url(#_Radial25)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M368.18 262.93s38.942-17.974 50.924-36.945c0 20.969 3.994 33.949-5.991 45.932-9.984 11.981-17.973 22.966-19.97 31.952-5.99-21.96-7.99-37.94-24.96-40.93l-.003-.009z',
											fill: 'url(#_Radial26)',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsxs)('defs', {
											children: [
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial1',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(680.844 0 0 673.97 385.872 166.08)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.02', stopColor: '#fdf7e2' }),
														Object(Bt.jsx)('stop', { offset: '.09', stopColor: '#f8e18c' }),
														Object(Bt.jsx)('stop', { offset: '.13', stopColor: '#f6d86a' }),
														Object(Bt.jsx)('stop', { offset: '.37', stopColor: '#f3cb5a' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#c47313' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial2',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-330.499 0 0 332.06 400.561 -112.46)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial3',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-476.271 0 0 478.52 374.087 -25.642)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial4',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(389.15 -49.608) scale(273.26)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial5',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-801.74 0 0 801.74 119 63.557)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial6',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-571.77 0 0 571.77 165.5 -1.679)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial7',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-776.58 0 0 776.58 324 -84.213)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial8',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-916.37 0 0 916.37 115 32.94)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial9',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(112.065 57.04 -57.3779 111.414 300.006 47.878)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.05', stopColor: '#fccdcc' }),
														Object(Bt.jsx)('stop', { offset: '.17', stopColor: '#f65954' }),
														Object(Bt.jsx)('stop', { offset: '.22', stopColor: '#f32b24' }),
														Object(Bt.jsx)('stop', { offset: '.52', stopColor: '#db2313' }),
														Object(Bt.jsx)('stop', { offset: '.77', stopColor: '#c8140d' }),
														Object(Bt.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#aa0e0b' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial10',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(199.688 101.639 -102.242 198.528 261.591 15.9)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.29' }),
														Object(Bt.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.29' }),
														Object(Bt.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.29' }),
														Object(Bt.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.29' }),
														Object(Bt.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.29' }),
														Object(Bt.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.29' }),
														Object(Bt.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.29' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.29' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial11',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(45.458 23.1377 -23.2748 45.1939 273.83 23.118)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.05', stopColor: '#fccdcc' }),
														Object(Bt.jsx)('stop', { offset: '.17', stopColor: '#f65954' }),
														Object(Bt.jsx)('stop', { offset: '.22', stopColor: '#f32b24' }),
														Object(Bt.jsx)('stop', { offset: '.52', stopColor: '#db2313' }),
														Object(Bt.jsx)('stop', { offset: '.77', stopColor: '#c8140d' }),
														Object(Bt.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#aa0e0b' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial12',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(367.494 187.051 -188.159 365.359 289.025 75.015)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.21' }),
														Object(Bt.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.21' }),
														Object(Bt.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.21' }),
														Object(Bt.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.21' }),
														Object(Bt.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.21' }),
														Object(Bt.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.21' }),
														Object(Bt.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.21' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.21' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial13',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(178.836 91.0261 -91.5654 177.797 213.143 -27.599)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.34' }),
														Object(Bt.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.34' }),
														Object(Bt.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.34' }),
														Object(Bt.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.34' }),
														Object(Bt.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.34' }),
														Object(Bt.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.34' }),
														Object(Bt.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.34' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.34' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial14',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(148.674 75.6735 -76.1219 147.81 224.603 19.902)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.19' }),
														Object(Bt.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.19' }),
														Object(Bt.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.19' }),
														Object(Bt.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.19' }),
														Object(Bt.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.19' }),
														Object(Bt.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.19' }),
														Object(Bt.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.19' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.19' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial15',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(275.869 140.415 -141.247 274.267 218.989 24.987)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.73' }),
														Object(Bt.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.73' }),
														Object(Bt.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.73' }),
														Object(Bt.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.73' }),
														Object(Bt.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.73' }),
														Object(Bt.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.73' }),
														Object(Bt.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.73' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.73' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial16',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-706.15 0 0 706.15 172.2 -66.915)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial17',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-522.49 0 0 522.49 198.8 -26.976)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial18',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-1480.2 0 0 1480.2 153.6 -16.316)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial19',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-557.955 0 0 550.74 483.967 178.05)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.02', stopColor: '#fdf7e2' }),
														Object(Bt.jsx)('stop', { offset: '.09', stopColor: '#f8e18c' }),
														Object(Bt.jsx)('stop', { offset: '.13', stopColor: '#f6d86a' }),
														Object(Bt.jsx)('stop', { offset: '.37', stopColor: '#f3cb5a' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#c47313' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial20',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(515.79 0 0 577.571 411.115 200.018)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial21',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(350.2 279.9) scale(243.53)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial22',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(389.71 331.56) scale(147.05)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.51' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.51' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.51' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.51' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.51' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.51' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.51' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial23',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(389 156.55) scale(1221.5)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.16' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.16' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.16' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.16' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.16' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.16' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.16' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial24',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(323 303.13) scale(277.01)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.5' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.5' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.5' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.5' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.5' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.5' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.5' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial25',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(256.68 346.73) scale(216.54)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: '_Radial26',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(415.74 207.61) scale(201.35)',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.33' }),
														Object(Bt.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.33' }),
														Object(Bt.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.33' }),
														Object(Bt.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.33' }),
														Object(Bt.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.33' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.33' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.33' }),
													],
												}),
											],
										}),
									],
								}),
							},
						),
					);
				});
			(Ht.displayName = 'CakeIcon'), (Ht.muiName = 'SvgIcon');
			var qt = Ht,
				Yt = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								className: 'disabled' in e && !0 === e.disabled ? 'greyscale' : void 0,
								children: Object(Bt.jsxs)('svg', {
									viewBox: '0 0 512 512',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.414',
									children: [
										Object(Bt.jsx)('path', {
											d: 'M450.332 134H61.668A9.667 9.667 0 0 1 52 124.332V79.605c0-5.339 4.328-9.667 9.668-9.667h388.668c5.336 0 9.664 4.328 9.664 9.667v44.727a9.667 9.667 0 0 1-9.668 9.668z',
											fill: '#fff',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M366.234 502H145.766a13.753 13.753 0 0 1-13.625-11.875L83.098 134h345.804l-49.043 356.125A13.753 13.753 0 0 1 366.234 502z',
											fill: '#91def5',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M392.23 10H119.77a13.752 13.752 0 0 0-12.661 8.387L85.258 69.938h341.484l-21.851-51.551A13.748 13.748 0 0 0 392.23 10z',
											fill: '#b0e7f8',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M354 311.816c0 54.125-43.875 98-98 98s-98-43.875-98-98 43.875-98 98-98 98 43.875 98 98z',
											fill: '#fff',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M314 311.816c0 32.032-25.969 58-58 58s-58-25.968-58-58c0-32.031 25.969-58 58-58s58 25.969 58 58z',
											fill: '#c68a65',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M450.332 59.938h-16.965L414.098 14.48A23.713 23.713 0 0 0 392.23 0H119.77a23.713 23.713 0 0 0-21.868 14.48L78.633 59.938H61.668C50.82 59.938 42 68.762 42 79.605v44.727C42 135.18 50.82 144 61.668 144h12.715l47.851 347.488C123.844 503.18 133.961 512 145.766 512h220.468c11.805 0 21.922-8.816 23.532-20.512L437.617 144h12.715C461.18 144 470 135.18 470 124.332V79.605c0-10.843-8.82-19.667-19.668-19.667zm-80.379 428.82a3.768 3.768 0 0 1-3.719 3.242H145.766a3.768 3.768 0 0 1-3.719-3.242L94.57 144h322.86l-47.477 344.758zM450 124H62V79.938h224.742c5.524 0 10-4.477 10-10 0-5.524-4.476-10-10-10H100.355l15.961-37.649A3.742 3.742 0 0 1 119.77 20h272.46c1.508 0 2.864.898 3.454 2.289l15.961 37.649h-44.903c-5.523 0-10 4.476-10 10 0 5.523 4.477 10 10 10h59.973c.012 0 .019.003.031.003l.051-.003H450V124z',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M148 311.816c0 59.551 48.449 108 108 108s108-48.449 108-108c0-59.55-48.449-108-108-108s-108 48.45-108 108zm108-88c48.523 0 88 39.477 88 88 0 48.524-39.477 88-88 88s-88-39.476-88-88c0-48.523 39.477-88 88-88z',
											fillRule: 'nonzero',
										}),
										Object(Bt.jsx)('path', {
											d: 'M207.918 359.898c12.844 12.844 29.918 19.918 48.082 19.918s35.238-7.074 48.082-19.918C316.926 347.055 324 329.98 324 311.816s-7.074-35.242-19.918-48.082c-12.844-12.843-29.918-19.918-48.082-19.918s-35.238 7.075-48.082 19.918C195.074 276.574 188 293.652 188 311.816s7.074 35.239 19.918 48.082zm82.023-14.14c-9.066 9.066-21.121 14.058-33.941 14.058-10.918 0-21.27-3.632-29.703-10.304 1.074-15.453 13.98-27.696 29.703-27.696 19.535 0 36.473-11.316 44.617-27.734A47.904 47.904 0 0 1 304 311.816c0 12.821-4.992 24.875-14.059 33.942zm-67.882-67.883c9.066-9.066 21.121-14.059 33.941-14.059 10.918 0 21.27 3.629 29.703 10.305-1.074 15.449-13.98 27.695-29.703 27.695-19.535 0-36.473 11.317-44.617 27.735A47.91 47.91 0 0 1 208 311.816c0-12.82 4.992-24.875 14.059-33.941zM326.738 59.941a10.07 10.07 0 0 0-7.066 2.93 10.047 10.047 0 0 0-2.934 7.07c0 2.629 1.071 5.207 2.934 7.071a10.07 10.07 0 0 0 7.066 2.929c2.633 0 5.211-1.07 7.071-2.929a10.039 10.039 0 0 0 2.929-7.071c0-2.632-1.058-5.211-2.929-7.07a10.063 10.063 0 0 0-7.071-2.93z',
											fillRule: 'nonzero',
										}),
									],
								}),
							},
						),
					);
				});
			(Yt.displayName = 'CoffeeIcon'), (Yt.muiName = 'SvgIcon');
			var Kt = Yt,
				Qt = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								className: 'disabled' in e && !0 === e.disabled ? 'greyscale' : void 0,
								children: Object(Bt.jsx)('svg', {
									viewBox: '0 0 540 540',
									xmlns: 'http://www.w3.org/2000/svg',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.41421',
									children: Object(Bt.jsx)('path', {
										d: 'M269.215.244l-270 270 270 270 270-270-270-270zm-190 81v103l36-36c1-14-1-28-9-40 13 7 26 9 41 8l35-35h-103zm276 0l36 35c14 1 28-1 40-8-7 12-9 26-8 40l36 36v-103h-104zm-86 13c32 34 73 17 73 73h31v31c56 0 39 45 72 72-33 31-15 73-72 73v31h-31c-1 56-41 37-73 73-33-36-72-17-73-73h-31v-31c-55 0-37-44-73-73 37-27 18-72 73-72v-31h31c-1-56 40-38 73-73zm0 6l-1 1c-13 12-29 18-45 25-9 3-17 10-20 19-3 8-3 17-3 26h-31v31c-11 0-22 0-31 7h-1c-8 7-12 17-16 27-5 12-11 25-21 34l-1 1 1 1c11 11 18 26 24 41 4 9 9 18 18 22s18 4 27 4v31h31c0 11 0 23 7 32 6 9 15 13 24 16 13 5 26 12 37 22l1 1 1-1c12-12 28-19 44-25 8-3 16-9 19-18 4-8 4-18 4-27h31v-31c11 0 23 0 33-6 10-7 14-18 18-28 5-12 11-24 19-33l1-1-1-1c-11-11-17-26-22-40-4-9-9-19-19-23-8-5-20-5-29-5v-31h-31c1-11 0-23-6-33-6-9-16-13-25-16-13-6-26-12-36-21l-1-1zm0 3c10 10 23 16 36 21 9 4 18 8 24 16 6 9 6 21 6 32v1h31v31h1c9 0 21 1 29 5 9 4 14 13 17 22 6 14 12 29 23 40-9 9-15 21-19 33-4 10-8 21-17 26-10 6-22 7-33 6h-1v31h-31v2c0 9 0 19-4 27-3 8-11 13-18 17-16 6-32 12-44 24-11-10-24-16-37-21-9-4-18-8-23-15-6-9-6-21-6-32v-2h-31v-31h-2c-9 1-18 0-26-3-9-4-14-13-18-21-5-15-12-30-23-41 9.356-9.697 16.518-21.293 21-34 3-10 7-20 15-26 9-6 21-7 31-7h2v-31h30v-1c0-9 1-18 4-26 2-9 10-14 18-18 15-6 32-13 45-25zm0 59l-24 2c-.823 0-1.5.677-1.5 1.5s.677 1.5 1.5 1.5c.314-.004.629-.006.943-.006 43.338 0 79 35.662 79 79s-35.662 79-79 79-79-35.662-79-79c0-.998.019-1.996.057-2.994.054-.161.081-.33.081-.5 0-.867-.714-1.581-1.581-1.581-.679 0-1.285.437-1.5 1.081-2.428 9.135-3.658 18.548-3.658 28.001 0 59.666 48.992 108.812 108.658 108.999 55.615-5.345 98.572-52.629 98.572-108.5s-42.957-103.155-98.572-108.5zm0 2c58.069.117 105.786 47.931 105.786 106 0 58.15-47.851 106-106 106-58.15 0-106-47.85-106-106 0-5.356.406-10.705 1.214-16 4.476 40.873 39.401 72.182 80.519 72.182 44.435 0 81-36.565 81-81 0-40.118-29.806-74.495-69.519-80.182l13-1zm13 5l16 10c24 18 37 50 32 80-5 31-29 59-59 68-30 10-65 2-86-22-3-3-9-8-17-24 0 8 2 16 3 19 12 37 46 67 85 72 4.27.543 8.571.816 12.876.816 55.955 0 102-46.044 102-102 0-12.591-2.331-25.074-6.876-36.816-10-28-34-52-63-61-1 0-11-4-19-4zm-24 27l-7 8 2 47c-1 6 2 15-4 18-7 3-16 4-21-1-5-6-3-15-2-21-5 5-8 13-8 21 0 7 4 13 11 14h12c9-3 14-11 18-19 7 4 15 4 22 1 8-2 18-5 26 0 5 7 7-5 11-8 6-4-1-3-5-4-11-3-18-14-29-16-6-3-13 2-16 7 1 3 8 3 11 6 3-3 8-1 10 3-3 3-11 1-15 2-6 0-13 0-16-6v-52zm-48 2l-2 4c-5 5 0 9 2 14v35c1 6-1 13-8 15-6 1-12 1-18-2-6-2-4-11-5-15-4 4-5 9-5 14-1 8 6 13 13 13l4 1c11 1 21-8 24-18l1-37c-1-6 3-13 3-19-3 0-7-5-9-5zm17 15c-4 0-8 2-7 7 0 6 7 8 12 10 1-2 4-6 7-4 7 4 8 12 8 19l1 5c3-4 3-12 3-18-1-10-10-18-20-19h-4zm-148 144v103h103l-35-35c-15-2-29 0-41 8 8-12 10-26 9-40l-36-36zm380 0l-36 36c-1 14 1 28 8 40-12-8-26-9-41-8l-35 35h104v-103z',
										fill: '#117b51',
										fillRule: 'nonzero',
									}),
								}),
							},
						),
					);
				});
			(Qt.displayName = 'HalalIcon'), (Qt.muiName = 'SvgIcon');
			var Xt = Qt,
				Jt = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								className: 'disabled' in e && !0 === e.disabled ? 'greyscale' : void 0,
								children: Object(Bt.jsxs)('svg', {
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 64 64',
									version: '1',
									children: [
										Object(Bt.jsxs)('defs', {
											children: [
												Object(Bt.jsxs)('radialGradient', {
													id: 'a',
													gradientUnits: 'userSpaceOnUse',
													cy: '15.163',
													cx: '15.891',
													r: '27.545',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#00f038', stopOpacity: '0' }),
													],
												}),
												Object(Bt.jsxs)('radialGradient', {
													id: 'b',
													gradientUnits: 'userSpaceOnUse',
													cy: '16.847',
													cx: '16.028',
													gradientTransform: 'matrix(.91888 .94532 -.71707 .69701 13.381 -10.047)',
													r: '27.545',
													children: [
														Object(Bt.jsx)('stop', { offset: '0', stopColor: '#ff9b9b' }),
														Object(Bt.jsx)('stop', { offset: '1', stopColor: '#f00000' }),
													],
												}),
											],
										}),
										Object(Bt.jsx)('path', {
											d: 'M55.091 27.727a27.545 27.545 0 1 1-55.091 0 27.545 27.545 0 1 1 55.091 0z',
											transform: 'translate(4.496 4.3147) scale(.99849)',
											fill: 'url(#a)',
										}),
										Object(Bt.jsx)('path', {
											d: 'M55.091 27.727a27.545 27.545 0 1 1-55.091 0 27.545 27.545 0 1 1 55.091 0z',
											transform: 'translate(4.496 4.3147) scale(.99849)',
											strokeLinejoin: 'round',
											stroke: '#be0000',
											strokeLinecap: 'round',
											strokeWidth: '2.5038',
											fill: 'url(#b)',
										}),
										Object(Bt.jsx)('path', {
											d: 'M36.094 18.812c-1.798 1.551-3.145 4.37-4.532 5.844-2.631-2.177-3.818-6.236-6.656-7.375-3.44.919-8.904 4.136-4.875 7.625 2.058 3.043 6.195 5.747 7.157 8.906-1.468 3.79-4.292 6.616-7.032 9.376 1.34 4.675 7.755.524 10.344-1.75 2.065-4.634 3.568.898 5.499 2.891 1.541 6.222 9.801 4.403 10.521-.74-2.84-4.549-6.781-8.924-9.52-13.401 1.085-4.655 5.63-7.771 6.69-12.282-1.79-3.122-5.284.353-7.596.906z',
											fill: '#fff',
										}),
									],
								}),
							},
						),
					);
				});
			(Jt.displayName = 'RedCrossofShameIcon'), (Jt.muiName = 'SvgIcon');
			var Zt = Jt,
				$t = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								className: 'disabled' in e && !0 === e.disabled ? 'greyscale' : void 0,
								children: Object(Bt.jsx)('svg', {
									viewBox: '0 0 523 479',
									xmlns: 'http://www.w3.org/2000/svg',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.414',
									children: Object(Bt.jsxs)('g', {
										fillRule: 'nonzero',
										children: [
											Object(Bt.jsx)('path', {
												d: 'M52.437 193.9c-15.64-303.35 121.8-74.13 202.84 16.57 74.63 59.84 233.43 163.71 233.43 163.71s-4.96 53.11-.26 53.93c0 0-78.52 34.22-79.96 34.64-39.96-7.31-81.06-29.05-115.73-49.86-24.28-13.58-78.72-53.28-99.31-72.42-56.09-42.96-97.39-92.99-141.01-146.57z',
												fill: '#dec5a3',
											}),
											Object(Bt.jsx)('path', {
												d: 'M51.297 210.49c-2.4-3.79-10.28-16.21-17.5-27.6-7.22-11.38-15.12-25.88-17.56-32.22-2.43-6.34-6.15-14.3-8.26-17.69-7.07-11.37-8.74-21.7-6.6-40.71 1.39-12.26 4.54-22.25 8.99-28.49 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-4.74-1.05-9.12-3.41-9.72-5.23-3.18-9.6 26.85-45.06 32.93-38.89 6.36 6.45 8.41 12.09 7.23 19.87-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.25-.38 6.46-1.36 3.98-3.22 35.95-1.11 38.97 2.58 1.62 1.98 4.5 3.83 6.38 4.11 11.52 1.7 22.79 12.83 76.29 75.37 54.52 63.73 84.93 94.85 120.42 123.25 37.67 30.14 44.95 35.44 71.24 51.72 46.4 28.76 64.64 39.47 68.52 40.23 7.02 1.39 44.12 31.31 52.5 42.35 7.95 10.47 11.95 21.28 13.47 36.36.94 9.37 2 17.38 2.34 17.81.35.43 3.2-1.38 6.32-4.02 7.25-6.11 14.25-.52 12.94 10.35-1.59 13.13-1.69 14.99-1.28 24.51.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.94-13.85-7-14.29-20.99-2.26-11.94 10.27-44.02 23.6-47.26 19.64-.73-.88-2.19-.89-3.25-.02-2.61 2.13-24.5-.02-37.12-3.65-38.48-11.08-127.84-58.89-156.8-83.88-13.35-11.53-44.39-36.97-54.37-44.57-4.26-3.24-19.31-16.86-33.44-30.27-14.14-13.41-31.09-29.4-37.67-35.54-12.12-11.3-49.37-55.63-57.4-68.3zm98.43-40.36c12.54-10.2 16.55-9.98 26.19 1.39 7.66 9.03 8.06 10.88 5.63 25.69l-2.62 15.95 14.06.78 14.07.79 3.05 11.36c3.36 12.49 7.4 14.1 16.65 6.63 2.46-1.98 6.84-3.15 9.72-2.59 4.27.83 5.17 2.24 4.91 7.61-.18 3.62 1.88 9.29 4.58 12.59 2.96 3.61 4.59 10.03 4.12 16.16-.79 10.1 3.05 14.57 8.62 10.01 7.31-5.99 17.59-6.2 22.3-.44 2.62 3.2 4.3 7.16 3.73 8.82-1.65 4.79 6.91 13.56 10.43 10.68 3.83-3.14 23.55 5.21 29.52 12.5 2.42 2.96 7.93 6.49 12.23 7.84 7.4 2.33 8 3.16 10.91 15.4l3.08 12.94 6.18-5.05c8.04-6.59 17.36-3.29 20.12 7.13 1.04 3.95 2.35 7.19 2.9 7.19.55 0 4.03-.64 7.72-1.41 4.39-.92 8.28.51 11.25 4.14 2.49 3.05 8.42 6.05 13.17 6.68 7.87 1.03 8.89 1.93 11.4 10.11 4.76 15.49 8.18 18.37 15.85 13.37 9.83-6.41 12.88-5.34 26.86 9.35l12.53 13.16-4.89-16.05c-5.68-18.63-12.75-25.44-23.48-22.6-6.59 1.74-7.73 1.03-13.34-8.4-5.37-9.01-7.41-10.47-16.1-11.54-11.36-1.41-23.1-7.44-24.87-12.78-.66-2-4.54-3.8-8.61-4-4.08-.21-8.97-2.27-10.87-4.59-1.9-2.32-6.4-4.66-10.01-5.2-6.12-.92-6.76-1.94-9.56-15.21-3.37-16.03-6.86-19.69-13.54-14.22-8.08 6.61-17.89 5.44-26.93-3.24-4.6-4.42-11.21-10.12-14.67-12.68-4.25-3.12-7.34-8.48-9.46-16.39-3.06-11.38-3.34-11.72-8.86-10.9-23.45 3.51-30.5-1.58-30.84-22.23-.26-15.92-3.87-21.29-10.62-15.77-8.04 6.59-18.19 3.45-25.12-7.78-3.29-5.34-8.3-10.45-11.22-11.43-4.13-1.4-5.3-3.81-5.45-11.18-.18-9.4-.18-9.4-8.65-11.28-9.01-2-17.03-9.57-15.34-14.5.6-1.75-3.01-3.99-8.76-5.45l-9.79-2.48 2.57-13.64 2.57-13.63-10.75 2.66c-5.91 1.47-11.09 2.26-11.5 1.75-.41-.5-1.61-5-2.67-9.99-1.82-8.57-2.39-9.15-10.06-10.16-10.48-1.37-15.64-7.86-16.26-20.45-.39-7.75-1.68-10.47-5.64-11.83-2.82-.98-7.61-5.67-10.64-10.42-5.54-8.7-13.51-12.47-18.22-8.62-1.57 1.29-.04 4.36 4.22 8.47 5.45 5.27 6.16 7.66 3.86 13.04-4.08 9.53-4.14 9.44 5.82 9.25 10.92-.22 14.27 3.24 14.5 14.98.15 8.05.78 9 7.29 11.05 10.81 3.4 18.62 14.26 14.41 20.05-3.44 4.73-.73 8.56 10.02 14.23 3 1.58 3.79 6.24 2.6 15.35-.94 7.19-1.14 13.79-.46 14.67.69.88 5.26-1.66 10.16-5.64zm336.85 209.77c1.74-1.43 1.61-4.43-.29-6.75-1.9-2.33-4.82-3.04-6.56-1.62-1.74 1.43-1.62 4.43.29 6.76 1.9 2.32 4.82 3.04 6.56 1.61z',
												fill: '#c25628',
											}),
											Object(Bt.jsx)('path', {
												d: 'M68.087 230.81c-1.29-4.13 4.09-9.25 6.56-6.24.94 1.15 3.65.5 6.01-1.44 2.37-1.93 3.07-3.95 1.56-4.47-1.51-.52-2.02-2.47-1.14-4.34.88-1.87-.19-1.27-2.39 1.33-2.59 3.07-4.83 3.7-6.39 1.78-1.33-1.62-3.65-2.05-5.16-.96-1.9 1.36-2.26 1.06-1.16-.97 1.73-3.2-6.16-10.23-8.94-7.96-.93.77-.37 3.84 1.25 6.84 2.27 4.21 1.69 4.05-2.56-.7-3.03-3.38-5.3-8.27-5.04-10.87.34-3.4-.52-4.6-3.07-4.29-2.04.24-5.57-2.96-8.3-7.55l-4.76-7.97 7.96 1.85c5.45 1.27 7.17.85 5.47-1.34-1.37-1.76-2.72-5.37-3-8.03-.45-4.28 0-4.66 4.12-3.37 2.54.8 3.77.38 2.73-.93-1.05-1.31-4.27-2.4-7.17-2.42-3.64-.03-4.68.69-3.35 2.31 1.06 1.29 1.11 3.01.12 3.82-.99.81-3.56-1.41-5.71-4.93-3.66-6-3.79-6-2.12-.01 2.16 7.77.66 9.58-3.61 4.36-1.74-2.12-3.06-7.57-2.93-12.11.13-4.53-.64-9.25-1.71-10.49-1.07-1.23-1.83.72-1.69 4.34.25 6.49.21 6.52-3.16 2.41-1.87-2.29-3.28-5.77-3.12-7.72.16-1.96-1.56-6.76-3.83-10.67-2.26-3.91-4.87-9.5-5.79-12.42-1.13-3.59-2.05-4.24-2.81-2.01-.63 1.82-2.13-1.01-3.33-6.31-3.56-15.58 1.03-44.75 8.74-55.55 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-11.03-2.44-12.08-6.11-5.44-19 6.31-12.23 16.21-21.14 20.75-18.65 2.55 1.4 2.8 1.2 1.22-1-1.09-1.51-.57-3.91 1.16-5.32 5.94-4.86 14.47 8.35 12.75 19.72-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.65-2.99 38.13-.77 37.85 2.44-.14 1.62-3.71 2.47-7.95 1.9-4.24-.58-13.06-.86-19.61-.63-10.9.37-11.95.92-12.5 6.49-.33 3.34-.15 5.7.42 5.24.56-.46 3.18-1.56 5.82-2.43 3.27-1.08 3.68-1.97 1.28-2.8-1.93-.66-2.52-2.02-1.3-3.02s2.99-.87 3.93.28 3.23.84 5.09-.68c2.22-1.81 4.1-1.2 5.46 1.75 1.3 2.83 6.82 4.97 14.74 5.7 12.84 1.19 15.58-1.16 3.48-2.98-3.63-.54-5.58-1.82-4.33-2.84 3.14-2.57 19.76 1.41 20.22 4.85.2 1.54 3.13 3.08 6.5 3.41 3.37.34 5.97 1.73 5.78 3.1-.2 1.37-1.74 1.66-3.44.64-1.7-1.03-3.52-.63-4.04.89-.52 1.51-2.53.81-4.47-1.56-1.99-2.44-4.89-3.19-6.66-1.74-1.73 1.41-4.04 1.47-5.14.13-1.1-1.34-2.08-1.54-2.19-.43-.11 1.1 2.68 3.66 6.2 5.68 4.92 2.83 5.92 4.52 4.33 7.31-1.43 2.51-3.28 2.15-6-1.17-3.49-4.27-18.98-7.66-22.36-4.9-.71.59 1.79 3.8 5.56 7.13 5.79 5.12 6.54 7.56 4.75 15.63l-2.12 9.57 9.16-.52c10.72-.61 15.6 4.12 14.16 13.7-1 6.63 2.68 19.03 4.27 14.4.43-1.25 3.88-.76 7.67 1.11 7.15 3.51 12.29 12.13 8.89 14.92-6.16 5.04-9.56 13.73-6.61 16.89 1.69 1.82 1.97 1.55 1.16-1.07-1.71-5.45 2.38-7.06 6.17-2.44 1.88 2.31 4.37 3.42 5.52 2.48 4.33-3.55 7.01 4.82 5.57 17.43-1.54 13.42.44 16.08 7.59 10.21 3.4-2.78 4.09-2.45 4.06 1.92-.03 4.31.57 4.78 3.31 2.54 2.63-2.16 4.2-1.11 7.42 4.94 2.67 5.03 4.46 6.61 5.16 4.57 1.55-4.51-4.45-14.44-10.34-17.13-4.49-2.04-4.32-2.15 1.53-.92 3.63.76 5.68.26 4.56-1.11s-.99-3.35.29-4.4c1.41-1.15 2.69 1.39 3.22 6.38.48 4.56 2.41 9.17 4.29 10.24 1.87 1.07 2.61 3.21 1.63 4.75-.98 1.55.76 1.66 3.86.23 4.88-2.24 4.94-3.1.42-6.46-2.87-2.13-5.63-6.14-6.12-8.9-.63-3.55 1.34-2.06 6.69 5.06 6.51 8.66 7.27 11.9 5.37 22.94-2.54 14.79-1.27 17.27 9.06 17.78 5.13.26 8.35 2.2 10.22 6.16 1.5 3.19 3.67 5 4.85 4.03 1.17-.96.86-3.45-.7-5.54-1.56-2.08-1.47-3.05.2-2.14 1.67.9 3.87 5.39 4.88 9.97 2.21 9.96 6.57 13.2 11.88 8.86 2.14-1.75 5.18-2.74 6.76-2.2 1.58.55 3.82-.67 4.98-2.7 1.16-2.03 3.01-2.6 4.11-1.26 1.09 1.35.33 2.66-1.69 2.93-2.47.33-2.33 1.27.42 2.84 2.25 1.28 3.61 3.76 3.02 5.49-.6 1.74 1.2 5.07 3.99 7.41 7.12 5.94 4.85 9.8-2.53 4.31-4.44-3.29-5.66-6.01-4.57-10.21.81-3.14.36-4.79-1.01-3.67s-3.93.46-5.68-1.47c-1.75-1.93-1.47.47.62 5.33s5.66 10.19 7.93 11.84c2.28 1.65 3.71 4.26 3.18 5.78-.52 1.53.33 3.21 1.9 3.75 1.56.54 3.28-.28 3.81-1.82 1.74-5.08 2.29-1.32 1.12 7.65-1.04 7.9-1.46 8.4-3.98 4.74-2.13-3.09-3.89-2.93-7.19.64-2.77 3-4.53 3.49-4.82 1.33-.58-4.34-3.39-2.02-5.11 4.21-.99 3.61-.46 4.52 2.16 3.71 4.84-1.5 10.73 6.38 7.04 9.41-1.66 1.35-2.84 3.79-2.62 5.41.24 1.8 2.23.29 5.12-3.88 3.77-5.45 4.99-6.05 6-2.97.71 2.13.11 4.02-1.32 4.21-1.43.19-2.41 1.81-2.17 3.6.24 1.79-.88 3.43-2.5 3.65-4 .53-2.71 1.69 6.11 5.48 4.13 1.77 7.29 2.11 7.03.75-.26-1.36.1-1.38.81-.03 2.89 5.5 12.45 8.85 14.58 5.12 1.63-2.86.87-4.37-3.01-5.98-6.67-2.77-9.41-6.15-6.75-8.33 1.15-.94 3.25-.29 4.67 1.45 3.49 4.26 26.38 15.05 28.41 13.39 2.88-2.36-3.4-12.58-7.55-12.3-2.87.19-2.91-.22-.17-1.43 2.12-.94 5.71.57 7.98 3.34 2.39 2.92 5.05 3.92 6.31 2.38 1.21-1.46 3.39-1.19 4.86.6 1.47 1.79 3.14 1.91 3.7.26.57-1.66 1.77-2.11 2.67-1.02.89 1.1.59 3.81-.67 6.03-1.27 2.22-.68 4.96 1.32 6.1 2.28 1.3 2.3 2.5.05 3.25-2.13.7-4.88-1.21-6.79-4.75-1.82-3.34-4.21-5.11-5.49-4.06-1.25 1.02-.66 2.77 1.31 3.9 3.52 2 1.52 11.07-3.04 13.76-1.27.76-1.29 3.28-.03 5.61 2.81 5.2 6.29 2.78 7.06-4.9 1.18-11.89 5.87-8.43 5.83 4.3-.02 4.63-.06 10.34-.09 12.69-.09 6.2 1.83 7.68 10.26 7.87 9.26.2 11.34-6.77 2.29-7.67-6.25-.62-13.56-7.14-8.73-7.79 1.54-.2 2.42-3.97 1.95-8.36-.72-6.82.04-8.11 5.21-8.77 7.75-1 8.62 3.9.96 5.41-4.8.95-5.06 1.54-1.53 3.56 2.34 1.33 2.95 2.6 1.37 2.82-1.59.23-3.04 2.97-3.23 6.11-.31 5.08.17 4.97 4.45-.96 2.65-3.66 5.95-7.66 7.35-8.89 1.4-1.22 1.95-2.95 1.23-3.83-.73-.88-2.41-4.86-3.74-8.83-2.02-6.04-1.58-7.15 2.69-6.72 12.84 1.28 17.37 5.18 19.4 16.7 2 11.34 6.25 17.26 12.19 16.95 2.12-.12 2.47.56.94 1.84-1.32 1.11-7.16 1.13-12.98.04-8.95-1.68-10.96-1.1-12.97 3.75-1.3 3.15-1.2 7.16.24 8.92 1.43 1.75 3.04 1.92 3.57.39.53-1.54 5.48-3.91 11-5.27 8.84-2.18 10.85-1.51 16.78 5.53 4.08 4.84 5.77 8.82 4.28 10.07-1.46 1.23-.52 1.85 2.34 1.52 3.2-.36 3.94.19 2.21 1.63-1.42 1.2-1.5 3.5-.18 5.12 1.56 1.91 3.56 1.36 5.68-1.55 1.8-2.47 1.86-4.98.14-5.57-1.94-.67-1.57-1.28.99-1.63 3.26-.43 3.83.55 2.74 4.76-.76 2.92-.17 5.42 1.31 5.57 1.48.15 2.02 2.28 1.2 4.73-1.1 3.3-.76 3.89 1.28 2.26 1.52-1.22 2.95-.79 3.18.94.24 1.73 1.42 2.33 2.64 1.33 1.22-.99 1.27-3 .11-4.45-1.58-1.98-1.09-2.3 1.94-1.3 3.26 1.08 3.77.49 2.61-3.01-.79-2.4-2.37-3.6-3.5-2.67-1.13.93-4-1.09-6.37-4.49-2.38-3.39-5.83-6.69-7.68-7.32-1.84-.64-2.31-2.97-1.05-5.2 1.6-2.81 2.7-2.84 3.6-.11 1.72 5.17 7.77 3.05 8.16-2.86.22-3.42-.81-4.73-3.97-5.04-2.54-.25-3.43-1.12-2.19-2.14 3.86-3.16 11.18-.85 16.02 5.05 2.64 3.22 5.7 5.12 6.81 4.21 1.11-.91 4.63-.57 7.82.75 4.66 1.93 6.26 5.02 8.17 15.78 2.58 14.45 4.77 15.38 15.51 6.59 7.54-6.18 17.66-1.78 27.3 11.87 4.47 6.34 8.9 10.9 9.84 10.13.94-.77-.16-8.52-2.44-17.22-2.29-8.7-3.05-16.72-1.69-17.83 1.82-1.49 2.45-.79 2.43 2.7-.02 2.59 1.3 4.91 2.92 5.15 1.62.25 1.22.73-.89 1.08-2.7.45-2.4 2.39.99 6.49 3.31 3.99 4.68 4.5 4.33 1.61-.42-3.46.18-3.85 3.22-2.11 5.95 3.39 8.95 12.27 4.64 13.7-2.11.7-4.08-.34-4.37-2.3-.29-1.96-1.06-.97-1.71 2.2-.65 3.17-.15 7.03 1.12 8.58 1.34 1.65.58 3.39-1.82 4.18-2.66.88-3.1 2.62-1.23 4.9 3.86 4.72 7.08-.83 5.24-9.05-1.29-5.75-.94-6.27 2.79-4.15 4 2.28 4.32 2.02 5.27-4.33.62-4.13-1.08-8.99-4.38-12.5-2.97-3.15-4.59-7.15-3.6-8.89 1.17-2.05 2.31-1.6 3.27 1.28.97 2.95 1.87 3.26 2.67.93 1.84-5.35 5.29 6.79 6.91 24.35.77 8.2 1.69 15.29 2.06 15.74.37.45 3.24-1.33 6.36-3.97 7.25-6.11 14.25-.52 12.94 10.35-1.59 13.13-1.69 14.99-1.28 24.51.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.94-13.85-7-14.29-20.99-2.26-11.94 10.27-44.02 23.6-47.26 19.64-.73-.88-2.73-.45-4.46.96-1.72 1.42-4.17 1.31-5.44-.24-1.26-1.55-5.47-2.97-9.34-3.16-3.87-.19-7.57-1.96-8.22-3.94-.65-1.97-2.7-3.38-4.55-3.13-1.85.24-2.45 1.57-1.32 2.94 1.12 1.37-1.8 1.65-6.5.6-6.6-1.46-9.01-3.37-10.59-8.39-2.01-6.38 1.35-4.91 6 2.63 1.43 2.33 2.27 2.22 2.53-.33.55-5.27-10.62-14.01-14.17-11.1-2.89 2.36-1.76 5.51 3.87 10.8 5.57 5.23-6.91 1.81-22.38-6.13-7.93-4.07-20.37-9.29-27.64-11.6-14.56-4.63-20.19-8.82-10.56-7.86 3.39.33 6.22-.52 6.31-1.9.08-1.38-1.38-1.97-3.24-1.31-1.85.67-4.55-.22-5.98-1.98-1.66-2.02-3.43-1.76-4.84.72-1.28 2.24-2.4 2.57-2.64.79-.23-1.71-1.41-2.3-2.63-1.3-1.22 1-4.32-.79-6.89-3.97-3.78-4.66-3.76-5.52.12-4.46 3.67 1 3.32.07-1.5-4.01-5.75-4.86-5.76-5.09-.15-2.58 3.38 1.51 8.35 1.87 11.04.8 2.7-1.07 5.62-1.07 6.5 0 .87 1.08 2.69 1.05 4.03-.05 1.34-1.09 1.15-2.12-.42-2.27-1.58-.15-.16-4.33 3.15-9.3l6.02-9.03-11.89 9.47c-11.14 8.87-12.44 9.23-20.31 5.58l-8.41-3.89 3.24 6.88c3.71 7.88.31 8.13-11.28.83-5.18-3.27-8.44-6.98-9.11-10.35-.69-3.48-2.52-5.41-5.42-5.7-3.32-.33-3.52-1.15-.83-3.34 1.95-1.61 4.71-1.5 6.12.22 1.41 1.73 3.51 2.37 4.66 1.43 3.3-2.7-2.7-8.27-7.28-6.76-2.26.75-5.24 0-6.61-1.67-1.36-1.67-2.95-1.68-3.52-.03-.56 1.65-1.89 1.95-2.94.67-1.06-1.29-2.43-.85-3.06.98-.82 2.38-.04 3.18 2.71 2.82 2.57-.35 4.15 1.15 4.74 4.5.7 3.92-1.6 3.18-10.47-3.33-8.92-6.56-11.36-9.46-11.33-13.49.03-4.11-.85-4.84-4.4-3.66-5.22 1.73-9.73-2.73-7.05-6.98 1.45-2.29.39-3.66-4.71-6.04l-6.58-3.07 4.01 5.45c3.66 4.98 3.56 5.21-1.11 2.65-10.39-5.7-19.9-14.38-16.26-14.86 1.91-.26 5.27 1.52 7.45 3.94 3 3.34 3.12 2.27.48-4.4-2.77-7.01-4.39-8.68-7.96-8.21-2.68.35-4.09 1.63-3.51 3.19 1.18 3.2-4.12 4.21-6.54 1.25-1.05-1.28 1.2-3.63 5.65-5.89 8.45-4.3 7.51-7.54-2.01-6.96-3.56.22-6.61-.66-6.79-1.96-.17-1.29-1.75-2.16-3.51-1.93-1.81.24-1.51 2.55.69 5.31 3.54 4.44 3.41 4.7-1.42 2.9-3.76-1.41-7.02-5.52-11.16-14.08-4.66-9.64-7.19-12.58-12.45-14.5-5.22-1.9-6.22-3.06-4.76-5.5 1.01-1.69 1.09-4 .17-5.12-.92-1.13-2.14-.69-2.71.96-1.8 5.26-3.6.2-3.01-8.49l.57-8.37-6.89 3.24c-4.68 2.21-6.72 4.67-6.36 7.65.43 3.5-.08 3.66-2.49.77-2.67-3.21.64-8.71 7.75-12.87 2.64-1.55-2.67-7.14-6.31-6.65-1.74.23-2.24 1.53-1.13 2.89 1.51 1.85.81 2.46-2.76 2.44-2.62-.02-6.18-2.62-7.9-5.79-1.72-3.17-5.93-6.92-9.35-8.34-7.35-3.05-7.7-6.06-.96-8.29 3.82-1.26 4.56-.75 3.46 2.42-1.04 3.04-.04 4.52 4.09 6.07 5.92 2.22 5.91 2.2-3.13-10.42-1.38-1.93-2.5-5.98-2.49-9.01.02-3.71-1.06-5.37-3.28-5.08-1.82.25-2.56 1.35-1.65 2.46 2.64 3.22-8.52 7.13-12.93 4.53-2.2-1.3-5.58-2.22-7.5-2.06-2.11.18-2.06-.9.13-2.72a4.91 4.91 0 0 1 6.8.49c1.98 2.22 2.74 2.2 2.04-.04-1.29-4.11-10.77-6.66-11.95-3.22-1.38 4.01-16.34-9.65-18.65-17.03zm9.72 8.64c3.69-3.02 4.6-8.72 1.67-10.39-5.38-3.07-9.88 2.15-5.97 6.92 1.88 2.3 3.82 3.86 4.3 3.47zm-26-45.1c2.54-2.08 4.36-.77 8.51 6.14 6 9.98 5.74 7.51-.68-6.47-2.8-6.09-4.75-8.5-5.39-6.64-.55 1.59-3.3 2.89-6.11 2.87-4.13-.03-4.58.62-2.34 3.36 1.53 1.86 4.23 2.2 6.01.74zm23.12 17.76c.56-1.65.1-4.11-1.04-5.47-1.25-1.48-1.86-.55-1.53 2.33.69 6.15 1.28 6.87 2.57 3.14zm-23.09-31.1c-.63-2.01-2.18-3.75-3.44-3.88-1.27-.12-.75 1.52 1.15 3.65 2.09 2.35 2.99 2.44 2.29.23zm-19.83-29.84c1.15-.94.94-3.13-.47-4.85-1.42-1.73-3.51-2.37-4.66-1.43-1.15.95-.94 3.13.47 4.85 1.42 1.73 3.51 2.37 4.66 1.43zm-9.98-16.29c2.83-2.31-3.01-12.22-8.56-14.52-4-1.66-4.46-2.76-1.99-4.79 2.05-1.67 1.63-4.56-1.17-7.98-2.53-3.09-4.83-4.06-5.43-2.29-.58 1.68.06 3.43 1.43 3.9 1.36.47 1.68 2.27.7 3.99-1.96 3.43 12.26 23.96 15.02 21.69zm44.61 54.32c1.15-.95.94-3.13-.47-4.85-1.42-1.73-3.51-2.37-4.66-1.43-1.15.94-.94 3.13.47 4.85 1.42 1.73 3.51 2.37 4.66 1.43zm-16.74-24.72c1.15-.95 1.32-2.66.38-3.81a2.721 2.721 0 0 0-3.81-.38 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm48.24 58.6c-1.14-3.71-3.48-6.89-5.19-7.06-1.71-.17-.78 2.87 2.08 6.75 4.89 6.64 5.08 6.66 3.11.31zm120.11 138.73c3.53 1.17 4.55.45 5.37-3.76.9-4.62.28-5.29-5.48-5.96-9.01-1.04-8.92 6.72.11 9.72zM6.517 96.38c1.22-2.13 1.4-3.96.4-4.06-1-.1-2.31 1.26-2.91 3.03-1.65 4.79-.02 5.47 2.51 1.03zm68.87 84.49c1.68-1.37 1.9-2.89.49-3.37-1.4-.49-2.98.38-3.51 1.92-1.35 3.93-.5 4.33 3.02 1.45zm137.33 160.05c.96-1.75-.6-1.26-3.48 1.09-2.88 2.36-3.66 3.79-1.75 3.2 1.91-.6 4.27-2.53 5.23-4.29zm34.26 47.46c6.37-2.93 3.92-10.83-3.42-11.02-3.01-.08-3.61.21-1.33.66 6.46 1.26 7.14 3.67 1.85 6.54-6.22 3.36-3.61 6.8 2.9 3.82zM98.917 204.69c.45-.37-.33-2.08-1.74-3.81-1.42-1.72-3.49-2.39-4.6-1.48-1.11.91-.33 2.63 1.75 3.81 2.07 1.19 4.14 1.85 4.59 1.48zm103.2 128.62c1.15-.94 1.32-2.65.38-3.8a2.72 2.72 0 0 0-3.81-.38 2.71 2.71 0 0 0-.37 3.81 2.698 2.698 0 0 0 3.8.37zm-48.62-76.98c3.67-3 3.54-3.4-1.04-3.15-2.88.16-6.16-.84-7.29-2.22-1.13-1.38-2.48-1.28-2.99.21-1.65 4.8 6.97 8.72 11.32 5.16zM15.937 86.52c1.21 3.66 1.57 3.47 2.51-1.36.62-3.22-.11-5.17-1.71-4.56-1.55.59-3.41-.74-4.14-2.94-1.03-3.12-.23-4.01 3.61-3.99 3.97.03 4.13-.43.81-2.32-5.12-2.92-5.33-2.74-8.5 7.33-2.16 6.88-1.89 7.84 1.71 5.89 2.75-1.49 4.8-.79 5.71 1.95zm87.99 114.07c1.15-.94 1.32-2.65.38-3.8a2.721 2.721 0 0 0-3.81-.38 2.708 2.708 0 0 0-.38 3.8c.94 1.15 2.66 1.33 3.81.38zm68.03 78.75c.54-3.6 3.44-8.04 6.43-9.86 4.32-2.62 6.18-2.1 9 2.53 1.95 3.2 3.7 4.42 3.89 2.72.42-3.89-17.37-26.63-19.48-24.9-.85.7-3.37.01-5.6-1.52-2.24-1.54-1.07.57 2.59 4.67 3.66 4.11 6.53 8.7 6.38 10.21-.15 1.51-3.61-1.34-7.7-6.32-4.08-4.99-7.52-8.01-7.65-6.71-.13 1.29 3.05 6.42 7.07 11.39 4.01 4.97 5.32 7.51 2.89 5.66-5.46-4.2-11.58-3.67-10.97.94.26 1.9 3.1 6.67 6.32 10.6 5.54 6.77 5.9 6.8 6.83.59zm107.7 133.73c4.46.03 4.55-.84.56-5.7-3.98-4.87-4.85-4.96-5.7-.57-.55 2.84-.81 5.41-.57 5.7.24.3 2.81.55 5.71.57zm-217-269.53c.51-.41.15-1.69-.79-2.84-.94-1.15-2.71-1.28-3.93-.28-1.22 1-.86 2.28.79 2.85 1.66.56 3.42.69 3.93.27zm27.61 26.26c.95-.75.37-1.82-1.29-2.39-1.65-.57-1.53-2.24.26-3.7 3.81-3.13 1.64-6.82-3.6-6.13-2.12.29-2.32.94-.49 1.57 1.77.61 1.19 3.72-1.32 7.11-3.51 4.72-3.48 5.9.13 5.45 2.52-.31 5.37-1.17 6.31-1.91zm114.6 145.54c.57-1.65.31-3.89-.58-4.97-.88-1.09-2.55-1.2-3.7-.26-1.15.94-.89 3.18.58 4.97 1.47 1.8 3.13 1.91 3.7.26zm57.48 71.73c3.34 1.91 4.08 1.54 3.67-1.84-.76-6.27-2.64-7.75-6.16-4.86-3.54 2.9-3.36 3.37 2.49 6.7zM106.507 179.7c7.72-3.64 14.52-.83 22.05 9.11 4.7 6.21 5.04 8.19 1.61 9.55-2.38.95-4.95 4.69-5.72 8.32-1.34 6.3-1.27 6.31 1.53.22 3.82-8.27 7.41-7.8 6.98.91-.3 6.07.15 6.7 3.9 5.45 2.33-.77 5.68.22 7.44 2.21 2.78 3.13 2.97 2.88 1.46-1.96-.97-3.12-3.54-5.95-5.82-6.44-5.78-1.24-5.93-7.59-.24-10.2 5.6-2.57 5.32-3.29-2.24-5.85-6.6-2.24-10.36-11-5.02-11.71 2.27-.3 2.34-.94.19-1.68-1.91-.65-2.55-1.95-1.42-2.87 1.13-.93 2.97-6.54 4.08-12.47 1.55-8.27.95-10.99-2.56-11.67-2.52-.49-5.5.72-6.63 2.7-1.49 2.61-3.43 1.89-7.16-2.67-4.08-4.97-6.34-5.59-11.05-3.04-3.33 1.81-5.45 4.66-4.84 6.51.73 2.2 2.55 1.54 5.5-1.99 4.02-4.82 4.81-4.66 9.03 1.76 3.24 4.93 6.7 7.02 11.5 6.96 6.68-.09 6.69-.01.58 2.9-4.24 2.02-4.86 2.88-1.91 2.64 3.65-.28 4.06.22 2.46 3.01-2.57 4.52-6.34 6.73-7.27 4.27-.42-1.1-1.97-1.06-3.44.08-4.04 3.13-18.98 2.34-19.43-1.04-.31-2.29-4.17.5-6.92 4.99-.18.3 1.39 1.51 3.47 2.7 2.09 1.19 6.54.87 9.89-.7zm-31.63-43.44c.72-3.66.1-4.48-3.08-4.06-2.19.3-4.39 2.6-4.88 5.12-.71 3.67-.09 4.49 3.09 4.06 2.19-.29 4.38-2.59 4.87-5.12zm231.98 292.97c1.73-1.41 2.39-3.48 1.48-4.6-.91-1.11-2.63-.32-3.81 1.75-1.18 2.08-1.85 4.14-1.48 4.6.37.45 2.09-.34 3.81-1.75zm-137.11-185.54c2.93.66 5.41.35 5.51-.69.43-4.28-15.56-3.93-17.97.39-2.22 3.97-1.99 4.15 2.33 1.76 2.65-1.47 7.2-2.12 10.13-1.46zm45.4 72.84c-.6-1.91-2.53-4.26-4.28-5.23-1.76-.96-1.27.61 1.08 3.48 2.36 2.88 3.8 3.66 3.2 1.75zm-10.1-29c2.07 4.4 3.74 5.39 5.98 3.55 1.91-1.56 3.64-.95 4.48 1.57 1.72 5.21 4.04 3.44 4.74-3.63.71-7.07-1.71-9.82-7.07-8.04-5.36 1.77-11.39-7.43-7.99-12.19 2.17-3.03 2.3-2.88 1.15 1.41-1.1 4.11-.63 4.74 3.21 4.3 5.72-.65 9.07-6.37 5.96-10.17-1.37-1.68-.33-4.48 2.46-6.6 2.66-2.03 4.05-2.25 3.09-.5-.97 1.76-.28 5 1.53 7.21 1.83 2.24 1.84 5.19.02 6.68-1.79 1.47-1.97 3.11-.39 3.66 1.58.54 3.87-.75 5.07-2.87 1.32-2.3 4.92-3.09 8.97-1.95 3.73 1.05 7.89.97 9.25-.17 1.63-1.38.98-1.9-1.91-1.55-2.41.3-4.59-1.04-4.85-2.96-.25-1.93-1.71-2.51-3.23-1.3-2.18 1.75-2.47 1.34-1.38-1.95 1.11-3.36.27-3.98-4.39-3.23-5.27.85-5.46.66-2.17-2.13 1.99-1.68 3.29-3.45 2.89-3.93-.39-.49-1.43-3.04-2.3-5.68-.9-2.71-2.01-3.58-2.55-1.99-.53 1.54-4.18 3.43-8.1 4.21-4.6.9-6.72.19-5.97-2.01.65-1.87 1.99-2.41 2.99-1.19 1 1.21 3.87.4 6.38-1.81 2.96-2.6 3.14-3.5.52-2.57-2.23.8-6.22.99-8.85.43-3.88-.83-5.46.31-8.22 5.93-2.53 5.15-2.3 7.17.9 7.79 3 .59 3.99 1.81 3.24 4.02-.6 1.74-3.02 2.07-5.38.72-3.97-2.26-4.26-1.99-3.95 3.68.19 3.37-.34 5.3-1.17 4.28-.84-1.01-1.4 1.12-1.26 4.73.14 3.62-.45 5.78-1.31 4.81-.86-.98-2.07.8-2.69 3.95-1.04 5.23-.68 5.45 4.15 2.55 4.3-2.58 5.81-2.03 8.15 2.94zm-47.09-50.82c1.15-.94 1.32-2.65.38-3.8a2.721 2.721 0 0 0-3.81-.38 2.708 2.708 0 0 0-.38 3.8 2.72 2.72 0 0 0 3.81.38zm162.58 186.92c.13-1.26-1.51-.75-3.64 1.15-2.35 2.09-2.44 3-.23 2.3 2.01-.64 3.75-2.19 3.87-3.45zM96.497 147.92c.27-2.73-.41-3.8-1.72-2.73-2.79 2.29-3.24 6.79-.7 7.04 1.08.11 2.17-1.83 2.42-4.31zm62.93 78.06c2.82-1.3 4.38-3.86 3.66-6.03-.77-2.33.63-4.41 3.64-5.43 4.23-1.44 4.14-1.82-.67-2.8-5.66-1.16-11.03 4.34-7.93 8.13.94 1.15-.15 2.71-2.41 3.46-2.27.75-3.47 2.16-2.67 3.14.8.98 3.67.77 6.38-.47zm99.75 119.45c-.12 1.26-2.24 1.62-4.69.8-3.82-1.26-4.07-.98-1.71 1.95 1.51 1.89 5.12 3.45 8.02 3.47 4.32.02 4.77-.58 2.49-3.36-3.1-3.79-2.87-4.22 3.32-6.27 2.39-.79 5.42-.13 6.74 1.48 1.31 1.6 3.32 2.14 4.47 1.2 4.19-3.43-2.68-7.27-9.67-5.42-3.95 1.05-8.27.57-9.6-1.06-2.55-3.11-9.99-1.9-10.34 1.69-.12 1.15 2.35 2.35 5.49 2.66 3.14.31 5.61 1.6 5.48 2.86zM48.187 92.51c.43-.36.73-3.36.66-6.66-.11-5.45-.25-5.46-1.44-.14-1.24 5.58-.94 8.21.78 6.8zm42.69 47.76c1.19-2.09 3.77-2.24 6.37-.35 2.4 1.75 5.3 2.4 6.45 1.46 1.31-1.07-.34-2.87-4.44-4.82-6.11-2.9-15.31 1.24-11.93 5.37.85 1.03 2.44.28 3.55-1.66zm75.06 93.39c1.15-.94 1.28-2.71.28-3.92-1-1.22-2.28-.87-2.84.79-.57 1.65-.7 3.42-.28 3.92.41.51 1.69.16 2.84-.79zm170.1 206.67c2.05-1.64 2.37-1.29 1.42 1.59-.92 2.79 1.15 4.54 8.36 7.08 5.27 1.85 10.61 2.53 11.86 1.51 1.24-1.02-.42-2.13-3.71-2.46-7.73-.76-8.43-1.82-2.74-4.1 4.27-1.71 4.15-1.85-1.68-1.85-3.45-.01-9.8-3.13-14.1-6.93-6.34-5.6-7.5-5.89-6.08-1.51 2.55 7.86 3.72 9.03 6.67 6.67zM10.917 42.66c.45-.37.21-2.53-.54-4.79-.75-2.27-2.28-3.38-3.39-2.47-1.12.91-.87 3.07.54 4.8 1.41 1.72 2.94 2.83 3.39 2.46zm14.67 10.28c.74-2.19 2.45-5.2 3.8-6.7 3.8-4.21 3.33-7.45-.62-4.22-3.79 3.1-8.43 14.5-6 14.74.81.08 2.08-1.64 2.82-3.82zm235.39 283.99c1.1 1.35 2.95 1.68 4.1.73 2.59-2.12.82-4.34-5.02-6.28-2.91-.97-4.06-2.67-3.31-4.87 2.09-6.06-2.99-11.02-7.49-7.33-2.9 2.37-3.04 4.13-.45 5.6 2.4 1.37 2.53 3.17.37 4.94-3.11 2.54-2.84 2.86 3.2 3.77 3.63.54 7.5 2.09 8.6 3.44zM33.187 53.41c2.67-3.2 4.21-6.6 3.43-7.56-.79-.95-3.48 1.62-5.99 5.71-5.47 8.94-4.15 9.9 2.56 1.85zm40.18 58.66c.56-1.66.69-3.42.27-3.93-.41-.51-1.69-.15-2.84.79-1.15.94-1.28 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm254.81 311.68c1.54-.2 1.72-2.71.41-5.56-1.96-4.27-2.56-4.32-3.34-.3-1.11 5.74-.8 6.36 2.93 5.86zm-212.82-263.31c-.63-2-2.18-3.75-3.45-3.87-1.26-.13-.74 1.51 1.15 3.64 2.1 2.36 3 2.45 2.3.23zm56.98 63.1c-1.08-6.09-7.74-9.18-6.95-3.21.29 2.19 2.17 4.92 4.18 6.06 3.07 1.76 3.51 1.31 2.77-2.85zm13.54 14.77c4.02-3.3 1.24-5.85-6.81-6.24-6.49-.32-6.55-.14-1.44 4.13 2.94 2.46 6.65 3.41 8.25 2.11zM14.297 30.92c.63-1.84 2.99-2.71 5.25-1.93 2.98 1.02 3.03.29.19-2.69-2.78-2.92-4.76-2.94-6.86-.04-1.63 2.23-2.23 4.95-1.34 6.03.88 1.08 2.13.47 2.76-1.37zm146.99 159.51c.42-4.25-6.05-2.74-10.34 2.42l-4.88 5.88 7.53-3.39c4.15-1.86 7.6-4.07 7.69-4.91zm-4.76 12.44c.57-2.89.24-5.34-.72-5.43-2.63-.26-4.19 5.93-2.12 8.46 1.14 1.39 2.21.24 2.84-3.03zm212.61 251.2c.9-6.04-5.04-7.01-8.27-1.36-1.92 3.38-1.4 4.42 2.58 5.2 3.92.76 5.13-.06 5.69-3.84zM83.807 100.43c.26-2.63-11.39-6.8-13.71-4.9-1.14.93 1.45 2.79 5.74 4.14 4.29 1.35 7.88 1.69 7.97.76zm65.19 91.21c1.15-.95 1.28-2.71.28-3.93-1-1.22-2.28-.86-2.85.79-.57 1.65-.69 3.42-.28 3.93.42.5 1.7.15 2.85-.79zm192.76 217.28c2.49.77 3.35-.31 2.97-3.71-.35-3.09-1.47-4.45-3.14-3.83-3.71 1.37-13.07-10.85-10.15-13.24 1.35-1.1 1.66-2.08.69-2.18-3.11-.31-9.05 9.72-6.31 10.66 1.46.5 4.56 2.5 6.89 4.44 3.15 2.63 3.11 4.56-.15 7.53-4.07 3.71-4.02 3.83.65 1.62 2.77-1.31 6.62-1.89 8.55-1.29zm-165.46-192.47c.57-1.66.7-3.42.28-3.93-.41-.51-1.7-.15-2.85.79-1.15.94-1.27 2.71-.27 3.93.99 1.22 2.28.86 2.84-.79zm12.92 14.92c2.51.25 3.84 1.05 2.96 1.78-.89.73.95 1.58 4.09 1.89 6.43.64 11.02-2.09 8.56-5.09-.9-1.09-3.49-1.72-5.77-1.39-5.24.75-13.5-3.97-10.8-6.18 1.11-.91 3.39-.02 5.05 1.98 2.57 3.07 2.94 2.91 2.45-1.09-.42-3.44-2.21-4.41-6.56-3.55-3.29.65-5.86-.02-5.71-1.48.14-1.46-.76-1.82-2-.8-4.42 3.62.93 13.25 7.73 13.93zm133.11 159.94c1.94-.74 1.63-2.08-.82-3.48-2.19-1.25-4.91-1.52-6.03-.6-2.75 2.25 2.87 5.6 6.85 4.08zm-203.97-258.43c4.59-3.76 5.46-6.11 3.24-8.77-2.42-2.91-2.92-2.75-2.49.79.3 2.44-1.31 5.05-3.59 5.8-3.63 1.21-5.68 4.58-4.01 6.62.31.38 3.4-1.62 6.85-4.44zm-82.59-96.59c1.15-.94.73-3.35-.93-5.35-2.59-3.1-2.95-2.94-2.49 1.16.68 6.04.87 6.28 3.42 4.19zm10.32 1.93c1.15-.95-.07-1.47-2.71-1.17-2.64.29-5.74 1.31-6.89 2.25-1.15.94.07 1.47 2.71 1.17 2.64-.3 5.74-1.31 6.89-2.25zm268.19 331.58c1.16 3.5 1.59 3.35 2.4-.82.8-4.09-.15-5.49-4.79-7.06-6.69-2.26-9.12-1.04-7.36 3.71.68 1.84 2.83 2.58 4.79 1.63 2.06-1.01 4.14.06 4.96 2.54zm-213.12-257.78c1.12-.92.33-2.63-1.74-3.81-2.08-1.19-4.14-1.85-4.6-1.48-.45.37.34 2.08 1.75 3.81 1.41 1.72 3.48 2.39 4.59 1.48zm-68.91-88.57c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.95-1.27 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm6.1-3.32c.56-2.89.14-5.34-.94-5.45-1.08-.11-1.97-2.6-1.99-5.53-.02-4.31-.3-4.58-1.43-1.41-.77 2.16-.56 6.61.46 9.9 2.6 8.31 2.75 8.41 3.9 2.49zm301.59 366.29c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.95-1.28 2.71-.28 3.93 1 1.22 2.28.87 2.85-.79zm33.67 38.53c2.19 1.25 5.57.96 7.52-.63 1.94-1.59 5.59-2.69 8.1-2.44 2.54.25 3.81-.48 2.86-1.64-.95-1.15-3.77-2.3-6.28-2.55-3.29-.33-3.9-1-2.18-2.41 1.31-1.07 3.74-1.49 5.39-.92 1.65.57 5.01-.73 7.45-2.88 2.45-2.16 2.89-3.43.97-2.83-1.91.59-4.57-.25-5.9-1.88-1.34-1.63-4.23-1.49-6.44.32s-5.98 3.94-8.39 4.74c-3.21 1.06-3.29 2.07-.33 3.76 5.39 3.07 2.4 5.22-4.84 3.48-6.02-1.44-4.82 1.95 2.07 5.88zm-40.62-55.55c1.15-.94 1.32-2.65.38-3.8a2.72 2.72 0 0 0-3.81-.38 2.698 2.698 0 0 0-.37 3.8 2.708 2.708 0 0 0 3.8.38zm11.42 7.24c-.87-4.56-.52-9.18.79-10.25 1.3-1.06 1.4-2.04.2-2.15-4.15-.42-6.42 12.47-2.92 16.58 2.98 3.49 3.28 2.85 1.93-4.18zm80.44 97.12c1.44-.19 1.53-1.68.2-3.3-1.33-1.63-2.8-1.83-3.28-.45-.47 1.38-.56 2.86-.2 3.3.36.44 1.83.64 3.28.45zm-48.9-67.66c3.74-4.09 2.3-8.89-3.66-12.22-3.59-2.01-3.94-.94-2.01 6.13 1.29 4.71 2.39 8.78 2.45 9.04.06.26 1.51-1.06 3.22-2.95zm-24.37-33.19c1.19-2.08 1.85-4.14 1.48-4.6-.37-.45-2.08.34-3.81 1.75-1.72 1.41-2.39 3.48-1.48 4.6.92 1.11 2.63.32 3.81-1.75zm14.82 11.69c.97 1.19-.15 2.8-2.5 3.58-2.59.86-3.02 1.84-1.09 2.5 1.75.6 4.04-.42 5.09-2.26 1.06-1.85 3.29-2.61 4.98-1.69 1.68.91 1.48-.42-.45-2.96-3.37-4.43-9.72-4.21-14.44.51-1.24 1.23-.25 1.32 2.2.2 2.44-1.12 5.24-1.07 6.21.12zm60.66 79.42c5.45-.12 5.46-.25.14-1.44-5.58-1.24-8.21-.95-6.8.78.36.43 3.35.73 6.66.66zm-96.89-117.77c.29-2.88 10.04-2.16 12.58.94 1.01 1.23 2.78 1.47 3.93.52 2.72-2.23.37-4.93-7.77-8.94-7.11-3.5-15.71 1.61-11.46 6.8 1.37 1.67 2.59 1.98 2.72.68zm86.15 91.18c.8-.65 1.65-3.24 1.9-5.75.36-3.55 1-3.9 2.92-1.56 1.49 1.82 2.72-1.3 3.14-7.99.74-11.96-6.47-22.11-10.59-14.9-1.44 2.52-2.41 2.66-2.71.37-.26-1.96-3.28-4.52-6.71-5.69-5.2-1.78-5.98-2.89-4.73-6.7 1.28-3.89.96-4.12-2.2-1.58-3.26 2.62-2.39 4.24 7.37 13.67 7.77 7.49 10.05 10.82 7.65 11.14-1.88.26-3.23 1.9-2.99 3.66.23 1.76 1.84 2.05 3.56.63 1.73-1.41 2.95-3.98 2.72-5.71-.23-1.74.47-3.89 1.57-4.78 1.65-1.36 2.69 1.64 4.62 13.3.11.67-2.19 1.2-5.11 1.18-6.81-.05-10.84 6.78-5.73 9.69 2.13 1.21 4.52 1.67 5.32 1.02zm-55.72-73.17c3.01-2.46-.83-5.38-5.17-3.94-2.67.88-2.78 2.01-.34 3.39 2 1.15 4.48 1.39 5.51.55zm26.52 33.91c2.08-1.86 2.11-2.72.07-2.08-2.52.78-3.77-.5-4.6-4.7-1.08-5.48-4.48-5.66-5.02-.26-.53 5.29 6.08 10.16 9.55 7.04zm27.29 2.39c1.15-.94 1.27-2.71.27-3.92-.99-1.22-2.27-.87-2.84.79-.57 1.65-.7 3.42-.28 3.92.42.51 1.7.16 2.85-.79zm54.61 57.25c.27-2.73-.4-3.81-1.71-2.74-2.79 2.29-3.24 6.79-.7 7.04 1.08.11 2.17-1.83 2.41-4.3zm-42.91-54.35c1.32-2.31 3.63-3.8 5.15-3.31 5.03 1.62 14.77-3.64 12.3-6.65-2.35-2.87-21.22 3.34-22.63 7.45-1.56 4.53 2.82 6.66 5.18 2.51zm9.55 5.92c2.92-1.16 5.48-.79 5.69.82.22 1.6 1.86 1.72 3.65.25 5.69-4.65-1.21-8.66-9.6-5.59-4.44 1.63-7.39 3.78-6.56 4.8.83 1.01 3.9.89 6.82-.28zm44.71 40.81c.96-1.76-.6-1.27-3.48 1.08-2.87 2.36-3.66 3.8-1.75 3.2 1.91-.6 4.27-2.53 5.23-4.28zm13.08-9.54c1.23-1-.06-2.16-3.04-2.74-2.85-.55-5.5-.74-5.9-.41-.4.32.97 1.56 3.05 2.74 2.07 1.18 4.73 1.37 5.89.41zm13.91 21.95c5.23-.7 4.14-3.02-1.58-3.35-2.83-.17-4.38.62-3.46 1.75.93 1.13 3.19 1.85 5.04 1.6zm-49.49-64.43c.56-1.65.69-3.42.27-3.93-.41-.51-1.69-.15-2.84.79-1.15.94-1.28 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm27.51 33.13c.63-1.84 3-2.71 5.27-1.93 3.24 1.12 4.13.49 4.2-2.96.04-2.41-.17-3.48-.47-2.38-.3 1.11-3.05 1.76-6.11 1.45-5.68-.56-8.83 3.31-5.75 7.07.94 1.15 2.23.59 2.86-1.25zm31.44 28.65c.45-.37.18-2.59-.59-4.93-.81-2.45-1.85-3-2.44-1.3-.98 2.86 1.33 7.62 3.03 6.23zm-8.02-24.99c2.84.94 4.44 3.14 4.42 6.07-.05 8.06 2.53 4.75 3.7-4.73.93-7.59.63-8.31-1.73-4.23-2.51 4.34-2.84 4.23-2.86-.94-.01-3.21 1.24-6.01 2.77-6.21 1.54-.21 1.98-1.37.98-2.59-2.22-2.71-4.42-1.03-6.38 4.89-.98 2.95-2.73 4.07-5.13 3.27-2-.66-2.87-.26-1.93.89.94 1.16 3.72 2.76 6.16 3.58zM96.447 260.87c2.45 1.83 6.1 3.15 8.1 2.92 2.66-.29 2.98.14 1.19 1.65-1.34 1.12-1.51 4.04-.39 6.49 1.12 2.44-1.43.2-5.67-4.97-4.24-5.18-5.69-7.92-3.23-6.09zm21.98 23.13c1.26.12 2.82 1.87 3.45 3.87.7 2.22-.21 2.13-2.3-.23-1.9-2.13-2.41-3.77-1.15-3.64zm27.34 24.64c1.73.94 4.08 3.74 5.22 6.21 1.13 2.47-.28 1.69-3.15-1.72-2.87-3.42-3.8-5.44-2.07-4.49zm-3.7-10.01c1.22-1 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.28.29-3.93-.28-1.65-.57-2.01-1.85-.79-2.85zm109.45-2.27c1.32-1.08.52-3.15-1.8-4.64-3.49-2.26-3.39-2.48.59-1.38 4.98 1.38 6.27 8.7 1.44 8.22-1.43-.14-1.53-1.14-.23-2.2zm11.83.79c1.15-.94.94-3.12-.48-4.85-1.41-1.72-1.63-3.9-.47-4.85 1.15-.94.93-3.12-.48-4.85-2.98-3.64 1.45-8 9.8-9.64 6.42-1.27 10.48 2.34 12.15 10.8.93 4.73.02 5.83-6.13 7.42-3.97 1.02-8.48.53-10.02-1.1-1.54-1.62-1.56-.15-.06 3.28 3.14 7.16.37 13.78-3.69 8.82-1.49-1.82-1.77-4.08-.62-5.03zm-150.5-211.77c.12-8.66-.93-11.18-5.44-13.05-7.03-2.92-8.1-4.22-5.31-6.5 1.22-1 2.39-.49 2.6 1.12.22 1.61 1.67 2.76 3.24 2.55 1.56-.2 1.8-2.65.52-5.44-1.55-3.37-.86-5.54 2.05-6.51 2.41-.79 5.04-.63 5.85.36.82.99 2.45.1 3.63-1.97 1.19-2.08 3.01-2.73 4.05-1.46s.48 3.47-1.24 4.88c-1.73 1.42-2.32 3.57-1.33 4.79 1 1.22.4 2.4-1.33 2.63-5.23.7-1.47 3.03 8.12 5.03 8.46 1.76 8.72 1.65 4.03-1.88-2.75-2.06-4.26-4.37-3.34-5.13 2.69-2.19 7.11 1.81 14.15 12.83 5.88 9.2 5.96 10.2.77 9.49-5.26-.72-5.78-.05-5.64 7.29.16 7.79-3.52 14.76-4.38 8.31-.24-1.73-2.26-1.64-4.51.2-8.03 6.57-16.69-2.64-16.49-17.54zm5.12-11.58c-1.82-3.32-2.79-7.55-2.15-9.4.63-1.86-.18-3.51-1.8-3.67-4.25-.42-2.58 8.19 2.73 14.07l4.53 5.02-3.31-6.02zm21.65 42.54c.05-10.49 2.38-12.01 3.42-2.22.77 7.18 1.25 7.7 6.42 6.87 3.08-.5 4.62-.06 3.43.97-1.19 1.04-4.67 1.97-7.74 2.08-5.14.18-5.57-.42-5.53-7.7zm23.48 17.91c3.73-12.7 2.56-19.03-2.77-15.05-2.05 1.53-3.12 1.61-2.36.18.75-1.42 2.34-3 3.53-3.49 1.2-.5 1.64-4.4 1-8.68-.66-4.41-.31-5.64.82-2.85 1.09 2.72 4.38 5.43 7.31 6.03 4.5.92 4.59 1.34.63 2.69-6.31 2.14-5.28 6.92 2.15 10 3.34 1.39 4.67 2.71 2.96 2.93-4.97.67 3.01 12.67 8.8 13.25 2.87.28 5.96 1.43 6.87 2.54 2.35 2.87-1.99 9.59-5.43 8.41-1.58-.54-3.78-.25-4.89.66-1.11.91 1.53 2.77 5.87 4.13 4.34 1.37 7.83 1.26 7.75-.23-.21-4.19 5.96-10.2 7.97-7.75.98 1.2.02 3.63-2.14 5.4-2.16 1.77-3.95 5.58-3.97 8.48-.02 4.32.58 4.77 3.36 2.49 4.85-3.97 8.48 1.8 6.07 9.64-1.18 3.83-.13 9.45 2.47 13.25 2.48 3.63 4 5.05 3.38 3.15-.63-1.91.16-3.63 1.74-3.85 1.58-.21 1.94-1.67.79-3.24-1.16-1.57.25-1.64 3.12-.14 4.47 2.31 4.81 2.16 2.38-1.07-1.57-2.08-1.98-4.5-.91-5.38 1.07-.87.66-4.07-.92-7.1-1.59-3.03.45-1.16 4.52 4.16 6.6 8.64 6.85 10 2.29 12.79-3.86 2.36-4.2 4.06-1.39 7.01 2.04 2.14 4.07 2.82 4.52 1.51.45-1.31 3.48.64 6.74 4.34l5.91 6.72-3.72-7.44-3.71-7.44 6.41 5.22c3.53 2.88 5.96 6.52 5.42 8.11-.61 1.78 1.84 4.28 6.39 6.52 6.35 3.12 7.18 4.39 5.96 9.12-.79 3.02-.52 5.59.58 5.7 1.1.11 1.01 1.94-.21 4.08-2.83 4.96-5.41 1.91-4.1-4.83 1.49-7.66-6.2-15.89-11.09-11.89-2.18 1.78-7.39 3.26-11.6 3.28-6.4.04-8.44-1.42-12.54-8.91-2.7-4.93-3.74-9.12-2.31-9.31 1.42-.18 2.39-1.78 2.16-3.54-.24-1.76-1.67-2.19-3.19-.94-1.51 1.24-5.62 1.28-9.11.1-5.54-1.87-6.23-3.14-5.33-9.75 1.29-9.54-.11-11.2-12-14.21-8.51-2.16-9.76-3.29-11.08-9.95-.81-4.13-.19-9.5 1.39-11.92 1.58-2.42 1.59-4.85.03-5.38-1.56-.54-3.34.49-3.96 2.28-.67 1.95-1.31 1.8-1.6-.37-.27-2-1.45-2.85-2.64-1.88-1.18.97-2.76-.11-3.52-2.39-1-3.03-2.03-3.01-3.8.1-1.5 2.63-.83 5.42 1.78 7.32 2.32 1.68 2.93 3.23 1.36 3.44-5.71.76-7.29-5.34-4.14-16.05zm5.47-4.05c1.29-3.12 1.96-6.14 1.49-6.71-.47-.58-1.91 1.5-3.2 4.61-1.3 3.12-1.97 6.14-1.5 6.71.47.58 1.92-1.5 3.21-4.61zm19.72 15.29c1.22-.99.86-2.28-.79-2.84-1.66-.57-3.42-.7-3.93-.28-.51.41-.15 1.69.79 2.84.94 1.16 2.71 1.28 3.93.28zM75.117 35.52c.5-.42 2.27-.29 3.92.28 1.66.56 2.01 1.84.79 2.84-1.21 1-2.98.87-3.92-.28-.95-1.15-1.3-2.43-.79-2.84zm219.73 261.23c4.33-4.13 7.48-1.69 4.52 3.51-1.12 1.96-3.43 2.76-5.13 1.79-1.73-.98-1.46-3.33.61-5.3zm-145.93-184.13c1.17-2.07.99-4.15-.41-4.64-3.72-1.27-8.95-13.43-6.61-15.34 1.09-.9 2.17-.23 2.4 1.49.25 1.85 1.42 1.35 2.89-1.23 1.93-3.38 2.83-3.28 4.07.48.88 2.66 2.48 5.94 3.57 7.3 1.27 1.6.53 1.99-2.12 1.12-3.05-1.01-3.35.2-1.2 4.76 1.58 3.37 1.45 7.3-.3 8.74-4.05 3.31-5.05 2.15-2.29-2.68zm106.58 127.83c-.3-2.24.77-5.5 2.36-7.25 2.2-2.42 3.59-1.72 5.77 2.9 3.34 7.09 8.19 4.97 5.29-2.32-2.6-6.53 6.72-13.02 11.77-8.18 2.07 1.98 2.27 2.87.44 1.96-4.66-2.31-9.78 2.56-6.68 6.35 1.42 1.72 3.98 1.98 5.71.57 1.88-1.54 4.65-.66 6.92 2.19 3.76 4.74 3.75 4.76-3.31 3.58-3.89-.65-8.42-.48-10.05.37-4.92 2.58 1.53 7.71 6.97 5.55 2.77-1.1 8.62-.87 13 .5 4.38 1.38 6.55 2.7 4.82 2.93-3.37.45-1.75 8.62 1.97 9.9 1.23.42.95 1.82-.62 3.1-1.83 1.5-3.79.47-5.42-2.84-5.14-10.42-6.87-11.8-13.12-10.45-14.42 3.12-24.69-.4-25.82-8.86zm5.55 2.69c1.15-.94 1.27-2.71.27-3.93-.99-1.22-2.27-.86-2.84.79-.57 1.65-.7 3.42-.28 3.93.42.51 1.7.15 2.85-.79zm9.82 4.28c.11-1.17-1.91-2.33-4.5-2.58-3.75-.36-3.79.08-.22 2.13 2.48 1.42 4.6 1.62 4.72.45zm45.46 67.5c.57-1.66 1.85-2.01 2.84-.79 1 1.21.88 2.98-.27 3.92-1.15.95-2.44 1.3-2.85.79-.42-.5-.29-2.27.28-3.92zm-6.88-12.93c1.92-.74 4.92-.44 6.66.66 1.81 1.14 1.66 2.57-.33 3.33-1.93.73-4.92.43-6.66-.67-1.81-1.14-1.67-2.56.33-3.32zm-100.68-129.12c1.18-2.07 2.84-2.9 3.7-1.86 2.32 2.84.05 7.64-3.1 6.56-1.51-.52-1.78-2.63-.6-4.7zm-.63-15.68c-.44-3.86.24-3.86 3.44 0 2.23 2.68 2.6 4.99.84 5.23-3.79.5-3.61.72-4.28-5.23zm92.71 110.69c5.09-3.05 7.44-1.83 6.43 3.36-.74 3.83-1.84 4.18-5.27 1.69-2.79-2.03-3.2-3.82-1.16-5.05zm60.53 72.19c4.7-3.14 6.75-2.63 12.23 3.06 4.6 4.79 5.27 6.44 2.2 5.5-2.41-.74-4.92-2.99-5.59-5.01-.69-2.09-4.06-2.83-7.85-1.71l-6.63 1.94 5.64-3.78zm3.46 8.49c.57-1.65 1.85-2.01 2.85-.79.99 1.22.87 2.99-.28 3.93s-2.43 1.3-2.85.79c-.41-.51-.29-2.27.28-3.93zm-187.51-231.58c1.26.13 2.81 1.87 3.45 3.87.69 2.22-.21 2.13-2.3-.22-1.9-2.13-2.42-3.77-1.15-3.65zm135.56 163.96c1.82.62 4.35-.71 5.63-2.95 1.92-3.36 1.3-4.44-3.51-6.08-4.7-1.61-5.55-2.86-4.36-6.35 1.2-3.53.18-5-5.38-7.73-3.77-1.85-6.03-4.04-5.03-4.86 2.45-2 13.4 5.96 18.65 13.56 2.33 3.37 5.25 5.3 6.49 4.29 1.23-1.01 3.11-.79 4.16.49 1.09 1.33-.34 3.38-3.31 4.74-4.19 1.92-4.29 2.58-.53 3.31 2.58.5 5.66-.79 6.85-2.86 1.7-2.98 3.22-2.17 7.27 3.86 4.38 6.52 4.33 8.45-.32 13.24-7.32 7.53-12.07 6.54-21.76-4.51-4.48-5.11-6.67-8.78-4.85-8.15zm27.61 5.44c.46-.37-.33-2.08-1.74-3.81-1.41-1.72-3.48-2.39-4.6-1.47-1.11.91-.32 2.62 1.75 3.81 2.08 1.18 4.14 1.84 4.59 1.47zm30.35 66.94c1.26.13 2.81 1.87 3.45 3.88.7 2.21-.21 2.12-2.3-.23-1.9-2.13-2.41-3.77-1.15-3.65zm-121.71-154.59c-1.32-4.61-1.06-5.02 1.42-2.24 1.67 1.88 2.58 4.77 2.01 6.42-1.19 3.46-1.25 3.39-3.43-4.18zm14.98 13.94c-2.38-6.11-2.16-6.08 2.72.4 2.91 3.86 4.55 7.62 3.64 8.37-1.91 1.57-2.87.25-6.36-8.77zm27.26 24.85c-1.33-4.61-1.06-5.03 1.42-2.24 1.67 1.88 2.57 4.77 2.01 6.42-1.19 3.45-1.25 3.38-3.43-4.18zm15.38 10.11c1.12-.91 3.18-.25 4.6 1.48 1.41 1.73 2.2 3.44 1.74 3.81-.45.37-2.52-.29-4.59-1.48-2.08-1.18-2.86-2.9-1.75-3.81zm50.23 55.09c-1.04-7.59-2.94-12.29-4.89-12.03-1.95.26-2.78-1.67-2.13-5 .57-2.98 2.15-5.31 3.49-5.17 1.35.13 1.35 1.14.01 2.24-1.35 1.1-1.63 2.99-.63 4.21 1 1.22 2.32.75 2.93-1.04.62-1.79 1.95.64 2.95 5.39 1.72 8.11 2.1 8.46 6.2 5.59 3.51-2.46 3.36-3.74-.76-6.51-3.97-2.67-4.12-3.38-.64-3.13 6.61.49 10.3 11.37 4.51 13.31-3.56 1.19-3.55 1.62.06 1.99 3.62.38 4.86-.78 5.77-5.38 1.06-5.39 1.27-5.3 2.53 1.06.76 3.81 2.68 7.73 4.27 8.73 1.59.99 4.1 5.84 5.58 10.76 3.1 10.31 6.78 13.1 15.76 11.95 8.63-1.11 9.5-5.3 2.51-12.07-4.77-4.61-4.94-5.61-.95-5.59 2.67.02 5.56 1.22 6.42 2.66.86 1.44 6.35 4.99 12.21 7.88 5.85 2.89 11.91 7.01 13.47 9.14 1.55 2.13 3.26 2.6 3.79 1.05.54-1.56 1.73-1.91 2.65-.78.92 1.12 3.68 3.28 6.14 4.79 3.99 2.45 3.77 2.58-2.09 1.25-5.39-1.22-6.74-.56-7.57 3.72-1.49 7.69-7.57 3.15-6.31-4.72.91-5.66.32-6.36-9.59-11.36-9.14-4.61-10.01-4.6-6.47.05 5 6.58 6.32 14.83 2.29 14.43-1.62-.16-2.27-2.24-1.46-4.63.82-2.38.07-4.42-1.68-4.54-1.74-.12-2.63 1.31-1.96 3.16 2.1 5.88-2.46 6.73-6.91 1.29-2.36-2.87-5.19-4.48-6.31-3.57-3.52 2.89 15.52 13.24 26.38 14.35 3.73.38 7.61 1.7 8.62 2.93 1.01 1.23-5.66.77-14.82-1.03-11.55-2.28-18.29-5.28-21.99-9.79-3.19-3.89-8.31-6.66-12.74-6.88-4.08-.2-7.92-1.9-8.54-3.77-.62-1.88-3.41-3.43-6.19-3.45-7.31-.04-11.98-7.26-13.91-21.49zm34.48 17.05c-.59-3.36-.74-7.37-.34-8.89.4-1.53-1.72-4.51-4.7-6.63-5.42-3.85-5.41-3.86 2.01-1.21 7.57 2.7 12.76 6.56 8.2 6.11-1.38-.14-1.86 2.75-1.07 6.41 1 4.67 2.48 6.58 4.91 6.39 2.1-.17 2.08.88-.03 2.64-4.81 4.02-7.73 2.45-8.98-4.82zm47.95 42.36c-2.29-6.31-1.53-7.91 6.95-14.47 6.57-5.08 10.26-6.47 11.9-4.47 1.96 2.4 1.42 2.89-3.15 2.86-4.87-.03-4.67.84 1.76 7.48 4 4.13 8.61 6.99 10.24 6.36 1.91-.74.89-2.92-2.87-6.12-3.21-2.73-4.59-4.89-3.07-4.79 1.51.09 7.03 4.74 12.25 10.33 8.24 8.83 8.8 10.16 4.23 10.13-4.21-.03-4.99-.82-3.97-4.01 1.03-3.18.32-3.87-3.54-3.47-6.99.74-9.02 3.07-4.77 5.49 2.03 1.16 3.25 3.4 2.7 4.98-.54 1.58-2.57.94-4.51-1.43s-4.25-3.75-5.14-3.07c-.88.68-4.94 1.25-9.01 1.27-6.07.03-7.89-1.25-10-7.07zm-13.53-28.62c.57-1.65 1.8-2.06 2.74-.91.95 1.15 1.25 3.44.68 5.1-.56 1.65-1.8 2.06-2.74.91-.94-1.15-1.25-3.44-.68-5.1z',
												fill: '#bb5326',
											}),
											Object(Bt.jsx)('path', {
												d: 'M79.027 238.45c1.15-.94 2.86-.77 3.8.38s2.76 1.23 4.05.18c1.35-1.11.14-3.74-2.88-6.27-2.87-2.4-4.17-4.5-2.88-4.67 3.96-.53 2.65-10.21-2.35-17.26-5.16-7.27-7.02-7.23-7.78.16-.4 3.82-.81 3.98-2.07.82-.86-2.18-3.09-6.94-4.95-10.6-3.16-6.19-2.66-7.2 7.38-15.05 10.04-7.85 11.18-8.08 16.8-3.47 3.31 2.72 7.2 4.22 8.64 3.34 1.44-.89 3.71-2.33 5.04-3.2 6.29-4.12 19.92-3.12 23.91 1.75 2.33 2.85 3.24 6 2.03 7-1.22.99-.83 2.29.86 2.87 1.69.58 2.16 1.51 1.03 2.07-2.4 1.2-11.16 13.35-10.34 14.35 3.63 4.44 13.72 7.32 15.39 4.41 3.97-6.97 20.03 10.42 18.57 20.12-1.12 7.48-13.85 12.84-18.11 7.64-1.49-1.82-3.13-2.08-3.65-.57-1.03 2.98 8.1 12.2 18.9 19.08 4.96 3.16 7.31 6.67 8.62 12.86 1 4.69 2.53 9.41 3.42 10.49 2.84 3.46 10.94-.85 10.13-5.39-.47-2.62 1.59-5.56 5.3-7.58 4.78-2.59 6.94-2.06 10.24 2.51 2.3 3.18 4.25 7.66 4.35 9.95.23 5.58 27.69 14.31 28.22 8.98.47-4.69 7.92-7.31 12.83-4.51 2.51 1.44 2.27 4.49-.75 9.42-3.98 6.51-2.4 15.4 2.09 11.73.97-.79 4.58-.05 8.03 1.65 4.99 2.46 6.1 4.33 5.45 9.17-2.48 18.3-1.64 24.88 3.61 28.37 7.85 5.21 18.95 5.29 23.66.17 3.42-3.71 3.05-5.63-2.2-11.43-3.47-3.84-7.59-6.49-9.16-5.89-1.88.71-3.21-.72-3.89-4.19-1.68-8.51 11.03-14.25 24.48-11.06 13.2 3.14 16.35 8.78 8.48 15.22-4.78 3.91-4.81 5.01-.23 8.05 13.77 9.1 14.9 10.66 11.49 15.89-2.24 3.44-5.77 5.04-10.6 4.8-6.22-.31-7.17.3-6.68 4.28.83 6.72 8.13 14.6 16.49 17.8 4 1.53 10.14 6.22 13.65 10.43 6.09 7.28 6.06 7.89-.55 13.04-3.81 2.97-8.25 4.98-9.86 4.47-1.61-.51-5.28.77-8.16 2.84-6.38 4.6-10.96.76-28.24-23.69-6.05-8.57-9.61-11.6-13.6-11.58-4.28.03-4.63.31-1.69 1.36 2.04.73 2.72 2.15 1.5 3.14-2.77 2.27-3.85.98-5.29-6.3-.87-4.41-1.57-4.98-3.03-2.43-2.42 4.25-19.74 2.09-21.31-2.64-.65-1.97-1.76-4.05-2.47-4.63-.71-.58-.34-6.13.82-12.34s1.21-12.39.11-13.73c-2.51-3.07-15.63-1.73-18.59 1.89-1.21 1.49-2.6 1.77-3.07.63-.48-1.14-4.52-3.18-8.97-4.54-4.82-1.46-10.64-5.89-14.38-10.93-3.46-4.66-9.63-10.26-13.71-12.45-5.69-3.05-9.22-7.32-15.05-18.19-6.49-12.12-8.71-14.56-15.08-16.56-7.43-2.34-24.39-21.51-19.62-22.19 1.29-.19 1.59-1.26.67-2.38-.92-1.12-2.31-3.98-3.1-6.35-.96-2.91-3.61-3.58-8.13-2.07-3.69 1.23-10.29.33-14.66-2.02-4.38-2.34-8.78-3.58-9.79-2.76-1.01.83-2.61.57-3.55-.58-.95-1.15-.77-2.87.38-3.81zm20.72-10.16c.08-5.37-4.73-20.1-5.67-17.37-.73 2.13-1.68 1.68-2.65-1.27-.84-2.51-2.36-3.88-3.39-3.04-1.03.85-.86 3.46.37 5.81 3.54 6.74 11.32 17.61 11.34 15.87zm-2.11-22.57c1.7 2.07 6.71-2.97 7.13-7.17.16-1.62-2.62-2.79-6.19-2.6-8.55.47-11.28 2.95-6.34 5.76 2.19 1.25 4.62 3.05 5.4 4.01zm104.48 127.59c1.15-.94 1.32-2.65.38-3.8a2.72 2.72 0 0 0-3.81-.38 2.71 2.71 0 0 0-.37 3.81 2.698 2.698 0 0 0 3.8.37zm8.88-14.41c4.21-.83 5.44-2.04 4.55-4.47-1.71-4.69-7.21-7.52-8.32-4.29-.51 1.48-1.74 1.69-2.74.47-.99-1.22-2.75-1.44-3.9-.5-3.73 3.05 4.46 9.97 10.41 8.79zM39.887 186.64c1.22-.99 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.28.29-3.93-.28-1.65-.57-2.01-1.85-.79-2.85zm12.97 15.59c.57-1.65 1.85-2.01 2.85-.79.99 1.22.87 2.98-.28 3.93-1.15.94-2.43 1.29-2.85.79-.41-.51-.29-2.28.28-3.93zm-41.03-67.54c1.19-.16 1.01-2.81-.4-5.88-1.42-3.08-3.77-5.46-5.24-5.29-9.72 1.14-6.51-44.76 4.18-59.74 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-10.98-2.43-12.22-6.48-5.52-18.07 6.62-11.47 19.72-24.79 17.57-17.86-.8 2.55-3.47 6.33-5.95 8.39-6 4.98-9.42 11.24-7.46 13.64.97 1.19 2.4.03 3.68-2.98 1.14-2.7 5.85-8.95 10.46-13.89 4.61-4.93 7.64-7.46 6.74-5.63-.9 1.83-.6 4.6.67 6.15 1.78 2.18.42 3.63-5.98 6.39-9.27 3.99-12.54 11.77-3.43 8.15 10.53-4.2 10.34 3.23-.51 19.84-4.03 6.17-5.97 12.3-4.74 14.99 1.15 2.5 1.21 5.27.12 6.16-1.08.89-2.16.2-2.39-1.53-.95-7.13-5.79 2.13-9.84 18.84-2.83 11.67-3.05 18.55-.64 19.92 2.03 1.16 2.43 2.27.9 2.47-1.53.21-2.14 2.32-1.35 4.71 1.99 6.01 2.91 6.79 4.06 3.44 1.09-3.18 7.75 12.59 7.51 17.78-.09 1.74 1.29 3.99 3.06 5 1.76 1 2.7 3.32 2.07 5.15-.77 2.23-2.96.76-6.67-4.44-3.04-4.27-4.56-7.89-3.37-8.05zm3.86-91.99c5.41-.12 5.44-.26.29-1.41-3.14-.71-5.91-2.76-6.15-4.57-.24-1.81-1.44-2.47-2.65-1.47-3.5 2.86 1.9 7.59 8.51 7.45zm11.72 112.55c-2.4-4.4-2.16-5.48.98-4.4 5.57 1.92 5.56-1.48-.05-10.42-8.53-13.61-12-21.85-9.92-23.55 1.14-.93-.07-3.09-2.68-4.79-3.8-2.47-3.78-5.79.11-16.68 3.6-10.09 3.77-14.41.66-16.78-2.87-2.18-2.95-3.06-.27-2.8 5.89.59 10.65-7.72 6.98-12.2-1.77-2.17-2.23-4.76-1.01-5.76 1.22-.99 2.4-.39 2.64 1.34.23 1.73 1.94 1.9 3.8.38 2.15-1.76 2.03-3.26-.33-4.1-2.84-1.02-2.55-1.35 1.24-1.44 2.72-.06 7.67-2.54 11-5.52 3.63-3.23 9.12-5.11 13.7-4.67 4.2.41 13.31.5 20.24.2 11.61-.5 13.23.26 20.38 9.52 4.49 5.82 5.56 8.18 2.53 5.61-5.92-5.06-20.35-7.79-24.25-4.6-2.02 1.66-.9 3.09 5.14 6.59 7.16 4.15 7.57 5.21 5.59 14.46l-2.14 9.99 9.94.61c11.78.72 13 1.88 13.28 12.58.12 4.49.75 10.08 1.41 12.42.66 2.34-.57 1.38-2.74-2.12-2.17-3.51-4.86-5.64-5.97-4.72-1.11.91-2.62-.14-3.35-2.34-1.88-5.69-21.99-8.36-27.7-3.68-4.59 3.75-3.74 9.59.97 6.63 1.26-.8 3.5-2.23 4.96-3.19 1.46-.95 4.18-.77 6.05.41 2.5 1.58 2.01 2.56-1.89 3.74-2.9.88-6.49 2.52-7.97 3.65-1.48 1.12-3.92.55-5.41-1.27-1.89-2.3-2.79-.23-2.96 6.82-.2 8.48-1.47 10.75-7.78 13.95-4.37 2.22-6.84 4.69-5.88 5.86 2.66 3.25 18.37-7.97 16.99-12.13-1.5-4.54 12.6-14.84 16.94-12.37 1.73.98 4.88.47 6.99-1.13 3.01-2.3 3.16-1.7.67 2.82-3.95 7.2-1.05 11.24 4.69 6.54 2.37-1.94 4.49-2.1 4.73-.35.23 1.75 3.31 2.27 6.85 1.16 4.81-1.52 5.53-1.24 2.88 1.1-2.16 1.9-2.21 4.78-.13 7.32 1.89 2.3 2.56 4.89 1.51 5.75-5.13 4.2-11.01 3.98-14.72-.55-3.23-3.95-5.2-4.1-9.32-.73-3.08 2.52-6.22 3.09-7.62 1.37-2.67-3.25-10.62-1.49-12.05 2.68-.51 1.49-1.57.78-2.34-1.56-1.54-4.63-5.02-2.6-9.64 5.64-2.64 4.69-2.32 4.91 5.63 4.07 4.63-.5 10.51-2.36 13.07-4.15 2.55-1.79 4.81-3.04 5.02-2.79.21.26 1.51 3.84 2.89 7.96 1.88 5.64 3.57 7.43 6.79 7.23 3.1-.2 3.03.22-.27 1.52-2.5.99-4.27 3.63-3.93 5.87.94 6.13-3.73 14.5-10.3 18.47-3.21 1.95-7.38 4.53-9.27 5.75-3.4 2.2-12.74-6.13-9.68-8.63 3.26-2.68-3.81-7.49-9.87-6.71-6.16.79-9.3-1.97-15.81-13.88zm22.49 9.23c1.15-.95 1.32-2.66.38-3.81a2.721 2.721 0 0 0-3.81-.38 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm1.21-80.75c.72-7.27.38-7.91-2.84-5.26-2.02 1.65-3.02 4.96-2.23 7.35 1.06 3.2.47 4.02-2.2 3.1-2.12-.72-4.21.39-4.99 2.66-1 2.91.29 3.47 5.05 2.17 5.13-1.4 6.55-3.37 7.21-10.02zm158.24 263.08c1.4-4.07 9.36-6.04 11.89-2.95 3.74 4.57-1.66 10.33-7.44 7.93-3.19-1.32-5.01-3.36-4.45-4.98zm45.83 40.89c3.86-3.16 8.93-1.48 7.56 2.51-.58 1.68-1.91 2-2.97.71-1.05-1.28-2.38-.98-2.95.67-.56 1.65-1.85 2.01-2.84.79-1-1.22-.46-3.33 1.2-4.68zm-245-300.18c.14-1.39 1.22-3.33 2.41-4.3 1.31-1.07 1.99 0 1.72 2.73-.25 2.48-1.34 4.41-2.42 4.31-1.08-.11-1.85-1.34-1.71-2.74zm77.38 84.55a2.7 2.7 0 1 1 3.423 4.18 2.7 2.7 0 0 1-3.423-4.18zm2.96-8.5c3.13-2.18 4.62-2.04 4.37.44-.24 2.48-1.86 3.61-4.74 3.32-3.29-.32-3.2-1.25.37-3.76zm37.92 43.71c1.39-2.44 2.51-2.33 3.4.34.72 2.19.47 4.67-.55 5.51-3.01 2.46-5.12-1.87-2.85-5.85zm197.15 233.63c2.59.25 4.62 1.41 4.5 2.58-.11 1.17-2.23.97-4.71-.45-3.58-2.05-3.53-2.49.21-2.13zM81.267 138.79c1.15-.94 2.86-.77 3.8.38a2.69 2.69 0 0 1-.38 3.8c-1.15.94-2.86.77-3.8-.38s-.77-2.86.38-3.8zm242.71 292.14c1.73-.23 3.87.47 4.76 1.55.89 1.09.67 2.74-.48 3.68-1.15.95-3.29.25-4.76-1.54-1.47-1.8-1.25-3.45.48-3.69zM137.467 199.8c.44-1.3 2.24-.62 3.98 1.51 1.75 2.13 2.06 4.03.7 4.21-1.36.18-3.16-.5-3.99-1.52-.83-1.01-1.14-2.9-.69-4.2zm26.2 26.92c3.96.19 7.39 1.95 7.64 3.89.28 2.27-.9 2.44-3.28.48-2.05-1.69-4.6-2.36-5.66-1.48-1.07.87-2.83.5-3.92-.83-1.13-1.38 1.11-2.26 5.22-2.06zm13.06 21.37c-1.59-3.44-.68-5.29 3.46-7.02 3.09-1.29 6.88-3.01 8.43-3.81 4.46-2.31 13.87-1.63 16.16 1.16 2.77 3.38-3.08 14.88-10.77 21.18-5.41 4.42-6.74 4.31-10.65-.89-2.45-3.27-5.44-8.05-6.63-10.62zm-44.36-66.64c1.27-3.21.73-4.54-1.7-4.22-4.5.6-7.5-2.88-4.57-5.28 1.22-.99 2.44-.15 2.71 1.88.32 2.42 1.25 2.35 2.71-.22 1.66-2.9 2.81-2.65 4.47.99 1.7 3.69 3.33 4 6.69 1.25 3.87-3.17 4.55-2.85 5.23 2.48.96 7.47-3.4 14.01-8.97 13.46-5.95-.6-8.69-4.92-6.57-10.34zm202.17 249.58c-.3-2.64-2.27-6.93-4.37-9.53-4.37-5.42-1.27-9.06 8.14-9.57 4.57-.25 6.73-1.63 7.32-4.68 1.01-5.23-5.13-13.28-10.54-13.82-2.7-.27-1.7-1.72 3.17-4.65 3.91-2.34 7.84-3.37 8.73-2.28.89 1.08 1.99.89 2.44-.43.46-1.32 3.46-1.51 6.67-.43 3.21 1.09 4.99 2.68 3.95 3.53-1.04.86 1.08 4.86 4.72 8.9 6.41 7.12 7.67 13.73 3.8 19.87-1.48 2.34.18 4.36 7.9 9.57 5.38 3.62 10.17 6.27 10.64 5.89 2.33-1.91 7.4-14.47 6.35-15.75-.65-.8 1.53-3.51 4.85-6.03 8.63-6.53 14.82.6 10.57 12.18-3.23 8.84.42 17.59 6.39 15.32 4.62-1.76 11.56-10.59 9.91-12.6-1.84-2.25-.68-13.26 1.59-15.12 3.57-2.92 13.84-.16 17.91 4.8 3.02 3.69 5.31 4.14 8.34 1.66 3.22-2.63 3.05-4.82-.74-9.44-8.25-10.08-13.15-21.11-10.39-23.37 5.35-4.39 13.62.02 23.49 12.52 11.38 14.41 15.2 13.91 10.94-1.41-2.64-9.5-2.45-10.21 1.77-6.49 2.6 2.31 5.13 7.9 5.61 12.43.71 6.61 2.18 8.89 7.42 11.47 6.26 3.07 6.23 3.45-.59 8.43-11.23 8.21-12.21 9.68-9.05 13.61 1.73 2.14 1.58 3.31-.34 2.78-1.82-.5-9.59 4.29-17.26 10.64-8.48 7.01-15.83 11.36-18.71 11.07-6.54-.65-9.36 2.18-4.78 4.79 2.08 1.18 2.63 3.09 1.23 4.25-1.39 1.15 1.41 1.28 6.22.27 4.82-1 9.59-3.27 10.6-5.05 1.01-1.78 3.24-2.75 4.96-2.16 1.87.65 8.99-4.29 17.86-12.37 9.22-8.4 15.78-12.89 17.5-11.98 1.74.93 2.62-.14 2.41-2.94-.26-3.63.29-4.05 3.19-2.39 1.93 1.1 3.65 5.62 3.83 10.04.18 4.42 1.81 8.89 3.62 9.92 2.08 1.19 1.67 3.22-1.11 5.49-2.42 1.99-5.3 2.51-6.4 1.17-1.1-1.34-2.09-1.54-2.2-.45-.44 4.43 8.18 6.41 11.56 2.66 4.42-4.92 3.08-22.79-1.67-22.16-2 .26-2.37-1.18-.95-3.68 1.37-2.4 2.52-2.82 2.76-1 .48 3.6 1.52 3.05 4.68-2.5 2.72-4.77-3.06-12.84-6.93-9.67-1.5 1.23-2.89 3.92-3.09 6-.25 2.48-3.59 2.54-9.83.18-5.2-1.97-8.16-3.52-6.58-3.44 4.69.25 7.83-10.65 3.73-12.99-2.04-1.16-2.67-2.26-1.39-2.44 1.27-.18 2.16-3.81 1.97-8.08-.31-7.21-.73-7.75-6.11-7.73-5.1.01-5.19.36-.79 2.92 3.59 2.09 3.83 2.79.85 2.51-2.79-.27-4.81-2.56-6.25-7.11-1.16-3.69-1.27-5.84-.24-4.76s3.92 2.64 6.41 3.47c3.9 1.29 4.51.54 4.36-5.32-.18-6.54-.09-6.54 2.29.07 1.36 3.79 3.09 13.6 3.85 21.81 1.43 15.38 2.89 19.93 4.7 14.66 1.76-5.1 11.36-7.43 14.55-3.53 1.66 2.02 2.6 7.04 2.1 11.15-1.57 12.88-1.68 14.84-1.27 24.35.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.86-13.51-7.07-14.21-20.04-3.33-13.5 11.33-18.29 13.61-39.95 19-18.04 4.49-22.02 3.76-13.44-2.48 3.01-2.18 6.44-2.8 7.61-1.36 1.18 1.44 3.09 1.84 4.24.9 2.88-2.36-5.43-12.04-9.84-11.45-1.96.26-3.17 2.67-2.69 5.35.47 2.68-.95 5.48-3.17 6.21-2.22.74-4.24-.17-4.48-2.01-.28-2.08-1.32-1.83-2.73.64-1.26 2.2-4.13 3.64-6.39 3.2-2.96-.57-2.79-2.01.63-5.17 3.19-2.94 6.34-3.33 9.62-1.19 4.5 2.93 4.81 2.76 3.94-2.13-.76-4.3-4.53-5.55-19.74-6.54-15.79-1.03-19.77-2.42-24.89-8.66-4.81-5.88-9.88-8.03-24.07-10.21-20.09-3.08-18.94-2.55-19.67-9.08zm124.31-31.92c1.08-.88 1.19-2.55.25-3.7-.94-1.15-3.18-.89-4.97.58-1.8 1.47-1.91 3.13-.26 3.7 1.66.57 3.89.31 4.98-.58zm28.41 22.16c2.3-1.89 3.46-4.31 2.57-5.4-2.3-2.8-7.72-1.66-8.94 1.88-1.75 5.08 1.96 7.13 6.37 3.52zm-135.65 27.94c.74-5.51 2.15-4.39 4.8 3.82 1.34 4.12.91 4.86-1.88 3.27-1.98-1.13-3.29-4.32-2.92-7.09zm-86.37-104.69c.51-.42 2.28-.29 3.93.28 1.65.56 2.01 1.85.79 2.84-1.22 1-2.99.87-3.93-.28s-1.3-2.43-.79-2.84zm-106.39-146.75c1.85-4.47 5.64-8.13 11.21-10.85 4.62-2.26 9.14-5.13 10.03-6.39 1.95-2.73 1.47 16.15-.58 22.77-2.15 6.96-8.02 11.53-10.67 8.3-1.28-1.57-3.28-2.08-4.43-1.14-4.14 3.39-8.3-6.09-5.56-12.69zm12.43 24.28c.22-.32 2.22-2.75 4.46-5.4 3.4-4.03 4.01-3.97 3.76.33-.16 2.83-1.31 4.54-2.55 3.82-1.25-.73-2.69-.09-3.21 1.42-.51 1.51-1.37 2.22-1.9 1.58-.52-.64-.78-1.43-.56-1.75zM358.307 443a2.72 2.72 0 0 1 3.81.38c.94 1.15.77 2.86-.38 3.8s-2.86.77-3.8-.38c-.95-1.15-.78-2.86.37-3.8zm-238.83-293.57c2.2-1.81 6.42 1.45 5.46 4.22-.57 1.68-2.25 1.59-3.72-.2-1.47-1.8-2.25-3.6-1.74-4.02zm192.8 225.27c1.85-.87 5.64-3.44 8.42-5.72 3.75-3.07 5.99-3 8.67.27 2.5 3.05 4.27 3.25 5.76.63 1.18-2.07 2.77-3.02 3.52-2.09 2.66 3.24.83 6.68-3.52 6.65-3.05-.02-4.27.99-3.96 3.27.24 1.82-1.39 4.8-3.62 6.63-3.09 2.53-5.26 1.87-9.06-2.78-2.75-3.35-6.02-5.91-7.28-5.69-1.26.23-.77-.3 1.07-1.17zM36.077 32.77c.93-3.51.6-6.76-.73-7.21-1.33-.46-.52-1.47 1.81-2.24 5.76-1.91 1.28-15.94-5.53-17.26-3.7-.72-4-1.53-1.36-3.7 6.17-5.05 14.78 7.86 13.01 19.51-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.34-2.74 38.14-.9 37.9 2-.12 1.37-4.69 2.05-10.16 1.5-5.47-.54-10.41.39-10.99 2.07-.58 1.68-1.81 1.59-2.74-.19-1.11-2.12-3.35-1.58-6.49 1.57-3.64 3.65-4.45 3.73-3.35.31 1.14-3.53-1.15-3.75-10.54-1-11.44 3.34-11.92 3.21-10.3-2.87zm194.26 239c1.73-1.41 3.88-1.65 4.8-.54.91 1.12-.2 2.64-2.47 3.39-2.26.75-4.42 1-4.79.55-.37-.46.74-1.98 2.46-3.4zm160.32 193.66c-.33-2.88.28-3.81 1.53-2.33 1.14 1.35 1.6 3.81 1.04 5.47-1.29 3.73-1.88 3-2.57-3.14zm-277.64-343.71c1.58-.21 1.49-2.1-.19-4.2-2.58-3.19-2.34-3.57 1.44-2.31 3.13 1.04 3.99 2.8 2.83 5.75-.91 2.34-.11 4.85 1.79 5.58 1.91.72 2.06 1.24.34 1.15-4.29-.22-9.78-5.5-6.21-5.97zm10.87 6.18c1.19-5.32 1.32-5.3 1.44.14.12 5.72-.69 8.24-2.1 6.52-.36-.44-.06-3.43.66-6.66zm119.98 137.23c2.36-1.65 4.43-1.94 4.61-.64.17 1.29-1.51 2.96-3.73 3.69-5.59 1.85-5.98.52-.88-3.05zm17.43 12.74c1.08-.89 5.13-2.66 8.99-3.96 7.65-2.55 11.87.7 13.08 10.06.7 5.47.14 6.04-6.69 6.77-7.43.79-19.61-9.41-15.38-12.87zM113.927 94.58c-2.97-8.57-1.25-16.6 3.55-16.57 2.52.01 5.02-1.24 5.55-2.79 1.29-3.75 11.33 3.89 13.44 10.23 2.71 8.14 1.5 12.96-3.93 15.56-10.17 4.89-15.3 3.12-18.61-6.43zm238.07 276.75c2.75-6.64 12.9-9.83 15.48-4.88 4.72 9.04 4.38 12.91-1.24 14.02-3.11.61-8.12.09-11.13-1.16-4.4-1.83-5.01-3.4-3.11-7.98zm-203.92-250.34c2.71-.9 4.82-.68 4.71.49-.12 1.17-2.33 1.91-4.92 1.64-3.74-.39-3.7-.82.21-2.13zm30.94 39.3c-1.06-8.7 9.66-5.57 18.28 5.33 4.27 5.4 6.07 8.84 4 7.65-2.07-1.19-7.35-2.98-11.72-3.98-9.04-2.06-9.79-2.7-10.56-9zm25.96 27.43c1.22-1 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.27.29-3.93-.28-1.65-.57-2-1.85-.79-2.85zm12.75 16.64c-2.23-4.85 1.86-9.75 6.74-8.08 1.67.58 3.39.06 3.81-1.17.42-1.22 3.95 1.24 7.85 5.47 8.57 9.29 7.69 13.45-3.12 14.6-7.84.83-10.94-1.36-15.28-10.82zM88.997 38c3.82-.83 6.84-.46 6.71.82-.13 1.27-3.25 1.95-6.94 1.49-6.41-.78-6.4-.89.23-2.31zm293.74 362.29c1.73-.23 3.87.47 4.76 1.55.89 1.08.67 2.74-.48 3.68s-3.29.24-4.76-1.55c-1.47-1.79-1.25-3.45.48-3.68zm-218.83-271.52c1.62-4.73 6.96-4.29 11.23.91 4.76 5.83 4.64 8.91-.42 10.58-5.22 1.73-7.64-1.8-6.2-9.05 1.14-5.73 1.06-5.82-1.53-1.87-2.96 4.53-4.72 4.21-3.08-.57zm165.5 194.02c2.22-12.44 14.98-5.17 17.76 10.12l1.31 7.23-7.46-2.1c-9.77-2.74-13.07-7.08-11.61-15.25zm44.3 59.63c1.27.13 2.82 1.87 3.45 3.88.7 2.21-.2 2.12-2.3-.23-1.89-2.13-2.41-3.77-1.15-3.65zm9.99 8.28c.85-4.39 1.27-4.51 2.52-.74.82 2.48.65 5.2-.38 6.04-2.69 2.21-3.3.69-2.14-5.3zm-165.09-203.65c1.15-.95 2.43-1.3 2.85-.79.41.5.29 2.27-.28 3.92-.57 1.66-1.85 2.01-2.85.79-.99-1.22-.87-2.98.28-3.92zm231.83 274.84c2.37-1.93 5.08-2.58 6.02-1.43.95 1.15.36 3.2-1.3 4.56-1.66 1.36-4.36 2-6.02 1.43-1.65-.56-1.06-2.62 1.3-4.56zm-149.87-194.05c1.44-1.18 3.44-.77 4.45.91 3.13 5.22 1.61 7.53-2.83 4.31-2.47-1.8-3.14-3.97-1.62-5.22zm99.2 120.88c-.4-5.29-1.82-7.7-4.88-8.3-2.38-.46-5.79-2.94-7.59-5.5-2.51-3.59-1.99-5.37 2.25-7.73 5.4-2.99 5.11-5.6-1.25-11.44-2.49-2.28-2.06-2.67 2.91-2.63 3.41.02 6.79 2.13 8.14 5.08 1.44 3.13 6.19 5.77 12.55 6.96l10.23 1.91 2.07 13.18c1.14 7.24 3.33 13.34 4.87 13.54 1.55.21-.37.82-4.25 1.36-3.88.54-7.64.27-8.35-.61-.72-.87-3.66.34-6.53 2.7-6.02 4.93-9.37 2.12-10.17-8.52zm24.17 4.04c.51-.42.15-1.7-.79-2.85-.94-1.15-2.71-1.28-3.93-.28-1.21 1-.86 2.28.79 2.85 1.66.57 3.42.69 3.93.28zm-6.11-19.02c.36-3.75-.08-3.79-2.13-.21-1.42 2.47-1.62 4.59-.45 4.71 1.17.11 2.33-1.91 2.58-4.5zm-98.75-86.92c1.1-5.63 8.93-8.84 12.11-4.95 1.24 1.51 4.03 3.76 6.21 5 6.85 3.91-.05 11.32-8.85 9.5-9.28-1.92-10.68-3.32-9.47-9.55zm-31.4-41.03c2.52.81 5.36 2.42 6.3 3.57.95 1.15-.35 1.43-2.88.61-2.53-.81-5.37-2.41-6.31-3.57-.94-1.15.36-1.42 2.89-.61zm24.79 22.11c-.43-3.19.42-3.56 3.79-1.64 5.24 2.99 5.37 4.61.44 5.27-2.13.29-3.91-1.24-4.23-3.63zm151.46 186.75c4.14-3.03 13.67-5.01 10.45-2.17-1.67 1.47-5.2 2.92-7.84 3.22-2.64.3-3.81-.18-2.61-1.05zm-105.35-143.7c-3.16-10.1 6.64-10.32 21.75-.5 4.61 2.99 10.94 18.22 8.42 20.28-3.02 2.47-11.09-.47-12.43-4.54-.74-2.22-3.78-4.05-6.77-4.06-6.07-.05-8.14-2.15-10.97-11.18zm13.95-14.68c1.67-1.37 3.2-1.29 3.4.18.19 1.47-.96 2.85-2.58 3.07-4.12.55-4.35-.36-.82-3.25zm66.44 59.95c.73-3.78 2.45-5.09 7.52-5.74 6.5-.84 12.68 4.2 15.46 12.59 1.3 3.91.55 4.47-7.55 5.72-9.79 1.5-17.02-4.39-15.43-12.57zm71.79 89.48c.57-1.65 1.85-2.01 2.85-.79.99 1.22.87 2.98-.28 3.93-1.15.94-2.43 1.29-2.85.79-.41-.51-.29-2.28.28-3.93z',
												fill: '#b64b25',
											}),
											Object(Bt.jsx)('path', {
												d: 'M79.027 238.45c1.15-.94 2.86-.77 3.8.38s.77 2.86-.38 3.81c-1.15.94-2.86.77-3.8-.38-.95-1.15-.77-2.87.38-3.81zm5.31-14.7c.15-5.39-1.46-9.6-4.41-11.53-3.04-1.98-3.45-3.18-1.19-3.48 2.16-.29 1.99-1.3-.46-2.69-2.14-1.22-5.21-1.15-6.81.16-3.88 3.17-8.44-2.74-7.72-9.99.36-3.62 2.42-6.33 5.47-7.19 2.69-.76 6.25-2.79 7.91-4.52 1.65-1.72 5.39-2.67 8.31-2.1 2.91.57 4.6 1.61 3.74 2.31-.86.7.77 1.73 3.62 2.28 2.84.55 6.79-.33 8.77-1.95 5.2-4.25 18.42-3.24 22.48 1.72 2.89 3.53 2.08 9.24-2.06 14.55-.47.6-1.72 3.4-2.78 6.22-1.67 4.43-.96 5.59 5.3 8.6 4.82 2.32 8.08 2.18 9.79-.42 3.97-6.05 19.99 11.4 17.42 18.98-2.25 6.65-11.14 10.66-14.51 6.54-1.35-1.65-3.75-1.94-5.33-.65-2.1 1.73-.52 4.96 5.94 12.13 4.84 5.38 10.37 10.32 12.29 10.98 4.1 1.41 11.97 15.8 8.87 16.21-1.16.15.13 3.01 2.87 6.36 3.96 4.83 5.9 5.31 9.5 2.36 2.5-2.04 4.05-5.28 3.45-7.19-.6-1.91.96-1.22 3.46 1.54 4.46 4.93 4.5 4.88 2.1-3.35-3.11-10.71 1.5-9.08 11.44 4.04 5.46 7.2 9.42 10.26 13.09 10.1 2.9-.13 7.27.92 9.7 2.34 3.23 1.87 5.52 1.11 8.45-2.83 4.34-5.84 11.27-5.4 10.66.68-.2 2.02-2.07 5.3-4.16 7.29-4.07 3.88.57 12.64 4.84 9.14 2.6-2.13 8.78.5 12.86 5.48 1.33 1.64.86 4.26-1.06 5.83-1.92 1.57-2.52 2.95-1.33 3.06 1.19.12 1.72 5.2 1.18 11.29-.84 9.57-.07 11.58 5.7 14.9 8.69 4.99 16.86 4.55 24.16-1.28 6.7-5.36 5.67-12.52-2.01-14.01-2.82-.55-4.43-1.57-3.57-2.28.85-.7-.71-1.71-3.47-2.25-6.67-1.29-7.08-6.58-.9-11.64 3.21-2.63 8.96-3.16 16.06-1.47 12.43 2.95 16.47 6.28 12.04 9.91-1.65 1.34-3.25 5.04-3.56 8.21-.52 5.15.35 6.13 8.11 9.15 7.2 2.8 8.45 4.08 7.31 7.5-1.87 5.59-10.42 9.21-13.34 5.64-3.46-4.22-6.59-.52-5.26 6.23 1.38 6.99 12.13 20.69 15.41 19.63 3.34-1.07 16.89 11.55 17.52 16.31.42 3.12-2.28 4.77-12.36 7.55-7.27 2.01-13.05 5.01-13.23 6.86-.19 1.86-7.07-5.25-15.76-16.27-15.24-19.32-24.93-26.32-23.83-17.22.28 2.27-.33 3.13-1.35 1.93-1.01-1.21-1.61-5.83-1.33-10.27.5-7.86-2.61-9.05-3.38-1.3-.57 5.77-14.72 2.83-20.53-4.26-2.64-3.23-3.72-6-2.41-6.18 1.31-.17 2.64-2.86 2.95-5.98.75-7.52-3.56-20.28-6.13-18.17-1.09.89-2.53-.04-3.2-2.07-.87-2.64-2.92-2.12-7.2 1.83-3.29 3.03-6.13 4.33-6.33 2.88-.19-1.45-1.32-1.84-2.51-.87-5.21 4.27-18.36-5.73-29.3-22.29-.62-.94.44-2.99 2.36-4.56 1.92-1.57 2.36-2.96.98-3.1-1.38-.14-2.49-2.37-2.47-4.97.02-2.59-.8-4.03-1.81-3.2-1.02.83-1.46 4.52-.99 8.21.52 4.03-.52 6.55-2.61 6.35-6.41-.64-14.01-12.06-22.7-34.08-1.69-4.3-3.18-5.26-5.36-3.47-1.66 1.36-5.47 2-8.46 1.42-4.5-.88-5.19-1.8-3.99-5.42.87-2.62.46-3.57-1.02-2.39-2.81 2.24-11.03-13.87-11.05-21.64-.01-5.02-12.55-8.26-16.01-4.15-1.16 1.37-5.2-.99-9.55-5.57-5.51-5.8-7.48-10.24-7.31-16.45zm-11.22-22.38a2.708 2.708 0 0 0-3.43-4.19 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm26.1 17.4c-1.67-8.04-1.38-12.69.74-11.96 5.38 1.85 9.23-2.83 6.76-8.21-4.9-10.69-20.26-3.28-19.31 9.31.3 4.02 3.69 11.07 7.54 15.66l6.99 8.35-2.72-13.15zm8.14-7.69c.12-1.17-2-1.39-4.7-.49-3.91 1.31-3.96 1.74-.22 2.13 2.59.27 4.81-.47 4.92-1.64zm95.62 123.28c.56-1.65.3-3.89-.58-4.97-.89-1.09-2.55-1.2-3.71-.26-1.15.94-.89 3.18.58 4.97 1.47 1.8 3.14 1.91 3.71.26zm4.16-12.84c6.44.64 9.82-2.84 8.02-8.26-1.82-5.5-15.72-7.72-17.41-2.79-1.51 4.38 3.67 10.48 9.39 11.05zm62.51 47.34c1.15-.95 1.32-2.66.38-3.81a2.708 2.708 0 0 0-3.8-.38 2.72 2.72 0 0 0-.38 3.81 2.708 2.708 0 0 0 3.8.38zM13.597 133.91c2.18-.72 3.54.31 3.58 2.73.05 2.15.72 5.73 1.51 7.97.79 2.24-.82 1.01-3.58-2.73-3.33-4.53-3.84-7.2-1.51-7.97zm14.23 20.68c-1.74-4.4-1.54-5.43.6-3.11 1.76 1.92 3.92 2.91 4.79 2.19 3.39-2.77-.32-13.8-8.2-24.38-4.54-6.08-7.43-11.73-6.42-12.56 1-.82.52-5.07-1.09-9.45-1.6-4.37-1.65-9.88-.11-12.24 1.54-2.36 3.39-8.58 4.11-13.83.72-5.24 1.63-9.15 2-8.69.38.46 2.92-3.36 5.65-8.48 5.08-9.56 17.78-18.38 20.93-14.53.92 1.12 2.1.8 2.63-.71 2.91-8.47 39.67-3.12 42.55 6.18.72 2.32.25 2.5-1.49.61-3.23-3.51-16.99-3.98-20.98-.71-1.67 1.37-1.63 3.31.08 4.3 12.69 7.35 13.51 8.67 10.66 17.1-1.57 4.65-3 9-3.19 9.65-.18.66 4.63 1.26 10.7 1.34 6.08.08 11.6.82 12.27 1.65.68.82 1.44 6.74 1.7 13.15l.47 11.65-4.12-7.89c-3.3-6.33-6.41-8.42-15.79-10.65-6.42-1.53-13.5-1.28-15.73.55-2.71 2.22-4.23 2.02-4.59-.61-.73-5.41-6.52 12.34-6.79 20.82-.15 4.62-2.58 8.49-7.41 11.82-3.95 2.73-6.69 6.35-6.08 8.04 1.59 4.44 18.81-7.77 20.58-14.58 1.1-4.26 2.59-5.56 6.38-5.53 3.84.02 4.82-.99 4.36-4.5-.36-2.74-1.62-4.15-3.19-3.57-1.43.53-3.33.07-4.23-1.03-.9-1.1 1.38-2.58 5.13-3.32 4.17-.82 6.03-.18 4.87 1.67-2.22 3.5 8.82 18.1 11.83 15.64 1.11-.91 2.64.19 3.39 2.46.86 2.61 2.6 3.12 4.72 1.37 3.76-3.07 4.19-2.84 6.24 3.35 2.33 7.06-4.01 9.6-10.55 4.23-5.16-4.23-6.74-4.16-10.6.46-3.66 4.38-4.82 4.55-6.03.9-1.43-4.32-4.22-3.65-11.62 2.77-1.32 1.14-3.02.18-3.79-2.15-1.11-3.34-2.23-3.07-5.35 1.27-2.17 3.02-5.23 6.57-6.8 7.88-5.04 4.21 6.7 4.78 15.45.74 9.66-4.47 15.09-.56 14.4 10.36-.29 4.5.01 8.84.67 9.64.65.8-1.29 4.19-4.33 7.52-3.77 4.13-6.24 5.18-7.79 3.28-1.25-1.52-3.21-2-4.36-1.06-1.15.94-.82 3.27.73 5.17 2.24 2.72 1.05 3.15-5.56 2.01-4.8-.82-7.71-2.54-6.78-4.01 2.49-3.94-1.88-7.73-11.31-9.82-9.23-2.05-9.71-2.48-13.61-12.36zm23.24 8.93c1.79-1.47 1.9-3.14.25-3.7-1.65-.57-3.89-.31-4.97.57-1.08.89-1.2 2.56-.26 3.71s3.18.89 4.98-.58zm14.08-.4c-.63-2-2.18-3.75-3.45-3.87-1.26-.13-.74 1.51 1.15 3.64 2.1 2.36 3 2.45 2.3.23zm-19.77-69.84c3.93-1.86 6.49-5.41 7.35-10.23 1.74-9.72-.19-11.58-6.58-6.35-4 3.28-4.34 5.39-1.43 9.04 3.41 4.29 3.27 4.57-1.4 2.82-2.86-1.07-5.63-.67-6.16.88-1.72 5 2.03 6.75 8.22 3.84zm35.5-19.96c.28-2.83-.76-2.43-3.5 1.33-2.22 3.05-2.39 4.78-.4 4.02 1.92-.74 3.68-3.14 3.9-5.35zm-79.5 44.23c-3.8-11.17 1.59-43.4 8.99-53.77 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-4.74-1.05-9.13-3.45-9.76-5.34-1.37-4.14 7.38-19.85 15.44-27.7 7.8-7.61 4.72.34-4.16 10.73-7.47 8.73-3.88 13.64 6.42 8.79 10.12-4.77 11.19 1.89 2.69 16.77-4.42 7.73-9 14.84-10.18 15.81-2.39 1.95-11.02 32.94-10.67 38.32.12 1.88 1.61 4.24 3.29 5.24 1.69.99 1.8 2.47.25 3.29-1.55.81-1.76 3.55-.47 6.08 1.35 2.65 2.79 3.32 3.39 1.59.62-1.8 1.98-.95 3.38 2.11 1.3 2.81 1.87 6.54 1.27 8.27-.69 2.01-1.69 1.33-2.75-1.89-.92-2.77-2.97-4.88-4.56-4.7-1.68.2-3.8-2.3-5.04-5.94zm15.13-73.85c9.43-.35 10.81-3.25 1.82-3.82-4.48-.29-8.33-1.86-8.54-3.48-.22-1.63-1.4-2.15-2.61-1.15-3.55 2.9 2.85 8.69 9.33 8.45zm193.92 300.28c2.74-2.24 11.13-.08 10.84 2.8-.52 5.21-5.96 6.91-9.25 2.89-1.89-2.3-2.6-4.86-1.59-5.69zm44.75 43.72c1.66-1.36 4.28-2.03 5.83-1.5 1.56.53.81 2.38-1.66 4.11-5.07 3.55-8.83 1.2-4.17-2.61zm-245-300.18c.14-1.39 1.22-3.33 2.41-4.3 1.31-1.07 1.99 0 1.72 2.73-.25 2.48-1.34 4.41-2.42 4.31-1.08-.11-1.85-1.34-1.71-2.74zm77.38 84.55a2.7 2.7 0 1 1 3.423 4.18 2.7 2.7 0 0 1-3.423-4.18zm40.4 36.79c1.22-.99 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.28.29-3.93-.28-1.65-.57-2.01-1.85-.79-2.85zm197.63 232.05c2.59.25 4.62 1.41 4.5 2.58-.11 1.17-2.23.97-4.71-.45-3.58-2.05-3.53-2.49.21-2.13zM81.267 138.79c1.15-.94 2.86-.77 3.8.38a2.69 2.69 0 0 1-.38 3.8c-1.15.94-2.86.77-3.8-.38s-.77-2.86.38-3.8zm242.71 292.14c1.73-.23 3.87.47 4.76 1.55.89 1.09.67 2.74-.48 3.68-1.15.95-3.29.25-4.76-1.54-1.47-1.8-1.25-3.45.48-3.69zm-160.31-204.21c3.96.19 7.39 1.95 7.64 3.89.28 2.27-.9 2.44-3.28.48-2.05-1.69-4.6-2.36-5.66-1.48-1.07.87-2.83.5-3.92-.83-1.13-1.38 1.11-2.26 5.22-2.06zm16.74 24.98c.52-1.51 2.01-2.09 3.32-1.29 1.53.95 2.89-.16 3.85-3.13 1.23-3.82.51-4.16-4.29-2.03-3.16 1.41-6.44 1.74-7.27.72-2.13-2.61 3.86-7.01 7.72-5.68 1.77.61 4.11-.46 5.2-2.38 1.11-1.95 4.64-2.37 8.03-.97 4.96 2.06 5.77 3.56 4.51 8.4-1.87 7.25-6.32 11.2-8.98 7.96-1.12-1.37-2.44.71-3.06 4.8-1.05 7.03-1.19 7.07-5.53 1.78-2.44-2.99-4.02-6.67-3.5-8.18zm171.2 197.51c.74-5.51 2.15-4.39 4.8 3.82 1.34 4.12.91 4.86-1.88 3.27-1.98-1.13-3.29-4.32-2.92-7.09zm-225.63-277.15c1.15-.95 2.43-1.3 2.85-.8.41.51.29 2.28-.28 3.93-.57 1.66-1.85 2.01-2.85.79-1-1.22-.87-2.98.28-3.92zm7.4 10.31c.46-1.34 3.85-4.07 7.53-6.07 5.21-2.83 6.68-2.61 6.66 1-.02 2.55-2 5.29-4.41 6.09-3.1 1.02-3.23 1.83-.46 2.79 2.62.9 2.69 1.8.2 2.75-4.22 1.61-10.78-2.91-9.52-6.56zm131.86 162.15c.51-.42 2.28-.29 3.93.28 1.65.56 2.01 1.85.79 2.84-1.22 1-2.99.87-3.93-.28s-1.3-2.43-.79-2.84zm66.13 79.49c-5.15-8.09-2.61-12.49 6.66-11.57 7.58.75 10.28-1.8 8.96-8.49-.75-3.8-3.25-6.43-8.09-8.51-6.59-2.84-6.67-3.2-1.39-6.06 3.09-1.68 7.66-1.73 10.14-.1 2.49 1.62 4.93 1.77 5.43.34.49-1.44 2.31-.59 4.04 1.88 1.72 2.47 2.3 5.18 1.27 6.02-1.03.84-.43 2.31 1.34 3.27 1.76.96 5.2 2.83 7.64 4.17 3.28 1.81 3.46 4.13.68 8.97-4.39 7.65-2.09 11.29 10.13 15.99 9.94 3.83 12.41 2.8 15.05-6.27.99-3.41 3.81-8.57 6.25-11.45 3.63-4.28 5.21-4.41 8.64-.72 2.31 2.49 3.54 4.95 2.73 5.47-5.1 3.3-7.67 12.25-5.09 17.73 3.85 8.17 6.53 8.21 19.15.27 6.55-4.12 8.61-6.24 5.69-5.86-6.67.86-7.39-9.53-1.03-14.74 4.12-3.37 6.24-2.96 12.04 2.37 9.7 8.9 18.35 4.11 14.01-7.75-2.11-5.77-1.73-8.61 1.28-9.6 2.78-.92 3.31-2.6 1.53-4.78-3.25-3.97-4.32-3.35-7.53 4.38-1.91 4.62-2.62 5.01-3.43 1.94-.56-2.13-1.79-6-2.72-8.59-1.83-5.04 2.02-9.88 6.6-8.3 1.52.52 8.1 7.27 14.63 14.99l11.85 14.05-.04-8.11c-.03-4.46-1.07-9.36-2.33-10.89-1.25-1.53-1.79-4.19-1.2-5.91 1.52-4.42 7.92 9.77 7.28 16.15-.41 4.18.98 5.68 8.19 8.79l8.68 3.75-.25-8.26c-.14-4.54-1.28-12.52-2.54-17.74-1.25-5.22-1.88-9.82-1.39-10.22 1.82-1.48 5.16 12.3 6.5 26.81 1.43 15.38 2.89 19.93 4.7 14.66 1.76-5.1 11.36-7.43 14.55-3.53 1.66 2.02 2.6 7.04 2.1 11.15-1.57 12.88-1.68 14.84-1.27 24.35.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.86-13.51-7.07-14.21-20.04-3.33-6.19 5.19-13.97 10.66-17.28 12.15-8.44 3.79-39.09 11.24-40.34 9.81-2.33-2.69 8.98-8.39 12.7-6.4 6.04 3.24 29.81-7.17 45.25-19.81l13.63-11.16 5.03 8.68c3.63 6.26 5.15 7.52 5.45 4.54.22-2.28-1.66-6.67-4.18-9.75-3.26-3.98-3.39-5.22-.44-4.27 3.44 1.11 4.06.51 3.64-3.49-.47-4.46 1.9-3.95 4.64 1 .64 1.16 2.19.3 3.44-1.91 1.33-2.31 2.46-2.69 2.7-.89.66 4.93 6.42-1.24 6.46-6.92.04-6.32-4.94-8.33-10.13-4.09-2.14 1.75-5.9 3.85-8.35 4.66-4.09 1.36-4.44.91-4.13-5.35.32-6.53.06-6.62-5.94-2.1-3.87 2.92-5.13 3.18-3.3.66 1.64-2.24 1.78-4.82.32-5.75-4.71-2.97-7.87.11-9.04 8.81-.64 4.68-3.98 11.07-7.42 14.22-3.45 3.15-7.25 7.71-8.44 10.15-4.76 9.67-53.73 14.78-60.65 6.32-.89-1.09-4.46-.64-7.92.99-3.47 1.64-7.72 1.55-9.45-.19-1.72-1.75-5.47-5.64-8.32-8.67-6.52-6.91-18.32-11.94-21.65-9.21-5.66 4.63-16.59-1.64-24.47-14.03zm178.47 40.11c6.18 1.6 6.32 1.46 7.5-7.51 1.43-10.91-1.71-19-6.73-17.34-3.9 1.29-4.45 6.32-1.59 14.36 1.47 4.12.84 5.03-3.43 5-6.64-.04-4.01 3.36 4.25 5.49zm-351.08-264.54c.76-5.05 3.13-8.03 8.59-10.8 9.3-4.72 12.62-3.76 13.61 3.98 1.49 11.6-2.02 16.65-11.72 16.84-10.63.21-11.84-.94-10.48-10.02zM358.307 443a2.72 2.72 0 0 1 3.81.38c.94 1.15.77 2.86-.38 3.8s-2.86.77-3.8-.38c-.95-1.15-.78-2.86.37-3.8zm-238.83-293.57c2.2-1.81 6.42 1.45 5.46 4.22-.57 1.68-2.25 1.59-3.72-.2-1.47-1.8-2.25-3.6-1.74-4.02zm56.89 66.82c1.72-4.99 3.78-3.46 2.98 2.21-.4 2.8-1.48 4.17-2.4 3.04-.92-1.12-1.18-3.49-.58-5.25zM24.517 16.02c8.34-9.92 10.98-9.66 5.51.55-2.9 5.41-5.51 7.84-8.15 7.58-2.63-.27-1.79-2.87 2.64-8.13zm205.82 255.75c1.73-1.41 3.88-1.65 4.8-.54.91 1.12-.2 2.64-2.47 3.39-2.26.75-4.42 1-4.79.55-.37-.46.74-1.98 2.46-3.4zm88.33 106.74c-4.25-7.38 5.4-15.73 10.7-9.26 2.5 3.05 4.27 3.25 5.76.63 1.18-2.07 2.77-3.02 3.52-2.09 2.68 3.26.82 6.68-3.61 6.65-3.17-.02-5.18 1.64-6.84 5.64-2.69 6.47-5.12 6.07-9.53-1.57zm71.99 86.92c-.33-2.88.28-3.81 1.53-2.33 1.14 1.35 1.6 3.81 1.04 5.47-1.29 3.73-1.88 3-2.57-3.14zM38.957 24.68c1.48-5.96.52-10.75-3.14-15.57-5.01-6.6-4.83-12.25.23-7.11 6.36 6.45 8.41 12.09 7.23 19.87-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.16-2.6 38.14-.98 37.92 1.75-.1 1.23-8.12 1.62-17.83.86-9.7-.76-20.87.34-24.81 2.43-8.87 4.72-11.86 1.51-9.07-9.74zm72.41 89.46c.46-.37 2.52.29 4.6 1.48 2.07 1.18 2.86 2.89 1.74 3.81-1.11.91-3.18.24-4.59-1.48-1.41-1.73-2.2-3.44-1.75-3.81zm297.85 354.82c3.19-2.94 6.65-3.13 11.44-.63 6.02 3.15 6.14 3.43.99 2.29-3.23-.72-7.36-.08-9.18 1.4-5.31 4.36-8.26 1.58-3.25-3.06zm-165.35-203.83c2.36-1.65 4.43-1.94 4.61-.64.17 1.29-1.51 2.96-3.73 3.69-5.59 1.85-5.98.52-.88-3.05zm17.15 12.97c5.54-4.54 17.62-5.03 20.2-.82 3.52 5.73-4.06 15.41-8.15 10.41-1.48-1.81-3.63-2.51-4.78-1.57-1.15.94-3.63-.17-5.52-2.47-1.88-2.3-2.67-4.8-1.75-5.55zM114.967 95.81c-1.23-2.65-2.02-8.14-1.76-12.2.42-6.65.89-7.16 4.64-5.02 2.29 1.31 5.38 1.38 6.86.17 4.55-3.72 10.26 1.71 11.45 10.89.76 5.93-.43 9.58-3.73 11.35-5.35 2.88-13.09 3.49-14.39 1.13-.45-.83-1.84-3.67-3.07-6.32zm235.42 278.9c.46-4.57 5.88-6.75 8.58-3.44 2.28 2.77 2.96 2.45 3.79-1.78.82-4.23 1.49-4.58 3.68-1.91 3.54 4.32 1.77 8.87-4.41 11.33-5.27 2.1-12.02-.34-11.64-4.2zm-171.63-213.56c-.6-1.91-.12-4.26 1.06-5.23 1.17-.96 2.75.09 3.49 2.34.78 2.36 2.26 3 3.49 1.51 1.22-1.48 4.22-.2 7.05 3 5.95 6.75 4.02 8.98-5.46 6.32-7.48-2.1-7.92-2.46-9.63-7.94zm26.22 26.57c1.22-1 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.27.29-3.93-.28-1.65-.57-2-1.85-.79-2.85zm14.34 17.9c-2.53-6.46.32-9.14 8.83-8.29 8.91.88 16.35 10.44 11.34 14.55-3.42 2.8-16.21 2.89-17.56.13-.28-.58-1.46-3.45-2.61-6.39zm9.6 4.43c.51-.42.15-1.7-.79-2.85-.94-1.15-2.71-1.27-3.93-.28-1.22 1-.86 2.28.79 2.85 1.65.57 3.42.69 3.93.28zm154.68 191.29a2.69 2.69 0 0 1 3.8.38c.94 1.15.77 2.86-.38 3.8s-2.86.77-3.8-.38a2.69 2.69 0 0 1 .38-3.8zM89.157 37.99c1.15-.94 3.45-1.25 5.1-.68 1.65.57 2.06 1.81.91 2.75s-3.44 1.24-5.09.68c-1.66-.57-2.07-1.81-.92-2.75zm74.82 90.58c.6-1.76 2.17-3.1 3.49-2.97 4.02.4 8.46 5.55 6.31 7.32-1.12.91-.68 2.13.97 2.69 1.65.57 1.54 2.24-.25 3.71-3.91 3.19-6.82-1.33-5.64-8.77.75-4.7.52-4.85-1.87-1.21-3.02 4.61-4.72 4.18-3.01-.77zm273.63 336.85c.5-.42 2.27-.29 3.92.28 1.66.56 2.01 1.85.8 2.84-1.22 1-2.99.88-3.93-.27-.94-1.16-1.3-2.44-.79-2.85zm-106.82-141.31c-.92-8.68-.8-8.83 4.88-6.47 7.86 3.26 10.5 6.91 10.72 14.8.15 5.59-.09 5.89-1.56 1.89-1.25-3.43-2.31-3.71-3.85-1-3.34 5.84-9.15.57-10.19-9.22zm52.91 66.59c.85-4.39 1.27-4.51 2.52-.74.82 2.48.65 5.2-.38 6.04-2.69 2.21-3.3.69-2.14-5.3zm-165.09-203.65c1.15-.95 2.43-1.3 2.85-.79.41.5.29 2.27-.28 3.92-.57 1.66-1.85 2.01-2.85.79-.99-1.22-.87-2.98.28-3.92zm233 273.89c1.73-1.42 3.91-1.63 4.85-.48.95 1.15.3 3.25-1.42 4.66-1.73 1.41-3.91 1.63-4.85.48-.94-1.15-.3-3.25 1.42-4.66zm-151.09-193.06c1.46-1.19 3.49-.09 4.7 2.56 1.18 2.56 1.89 4.86 1.58 5.11-.3.25-2.42-.9-4.7-2.56-2.35-1.71-3.03-3.92-1.58-5.11zm100.82 122.42c-.82-4.13-3.89-9.48-6.82-11.89-6.1-5.02-7-9.99-2.48-13.69 1.75-1.42 1.63-4.13-.25-6.08-1.86-1.93-1.99-4.01-.29-4.62 1.71-.61 5.08 1.71 7.49 5.16 2.87 4.09 6.62 6.1 10.85 5.78 6.93-.52 12.71 4.74 14.35 13.06.76 3.82-1.52 7.08-8.91 12.75-5.45 4.19-10.49 7.48-11.18 7.32-.69-.15-1.93-3.66-2.76-7.79zm15.8-12c.69-3.85.44-7.96-.54-9.13-.99-1.17-1.55.03-1.25 2.67.29 2.64-.26 3.88-1.24 2.76s-1.53.12-1.23 2.76c.89 7.94 2.93 8.39 4.26.94zm-98.23-91.28c.62-6.22 4.29-8.32 4.25-2.43-.02 4.09.58 4.16 3.35.34 2.88-3.96 4.18-3.68 8.72 1.87 3.39 4.14 4.29 7.38 2.46 8.88-5.6 4.58-19.46-1.81-18.78-8.66zm145.02 167.63c4.14-3.03 13.67-5.01 10.45-2.17-1.67 1.47-5.2 2.92-7.84 3.22-2.64.3-3.81-.18-2.61-1.05zm-152.43-189.93c.44-.37 2.84.82 5.32 2.63 2.49 1.81 3.24 3.46 1.67 3.67-2.74.36-8.64-4.95-6.99-6.3zm108.26 127.97c.43-.36 3.43-.06 6.66.66 5.31 1.19 5.3 1.32-.15 1.44-5.72.12-8.23-.69-6.51-2.1zm-60.23-80.83c-1.41-8.79 3.91-10.25 13.59-3.72 9.18 6.19 18.61 20.15 15.4 22.78-2.41 1.97-11.28-2.11-12.57-5.78-.58-1.64-3.48-3-6.44-3.02-6.22-.04-8.77-2.66-9.98-10.26zm12.15 6.65c1.73-.23 2.38-1.36 1.43-2.51-.94-1.15-3.13-1.9-4.86-1.67-1.73.23-2.38 1.36-1.44 2.51.95 1.15 3.13 1.9 4.87 1.67zm11.03 4.94c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.94-1.27 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm56.72 34.79c-.48-2.97.07-6.18 1.23-7.12 2.91-2.39 19.62 6.88 21.24 11.8 1.16 3.48.12 4.24-7.62 5.56-9.37 1.59-13.4-1.18-14.85-10.24zm45.35 30.12c6 1.93 8.26 4.7 4.28 5.23-1.74.23-4.44-1.18-6.02-3.14-2.46-3.07-2.23-3.36 1.74-2.09z',
												fill: '#b44b1b',
											}),
											Object(Bt.jsx)('path', {
												d: 'M84.647 223.56c.04-4.72-1.77-9.92-4.02-11.56-2.24-1.63-2.8-3.14-1.23-3.35 5.2-.7 1.2-2.55-6.57-3.05-6.68-.43-7.76-1.34-8.51-7.18-.53-4.12.76-7.19 3.35-7.97 2.31-.69 6.62-3.03 9.58-5.18 3.78-2.76 6.98-2.69 10.81.25 3.9 2.98 7.62 3.01 13.12.12 18.66-9.82 31.76 2.11 19.21 17.48-7.01 8.58 2.31 18.61 13.73 14.79 13.04-4.36 23.93 19 11.22 24.06-2.81 1.12-7.11.58-9.55-1.2-2.45-1.77-5.59-2.29-6.99-1.15-2.57 2.11 13.41 20.09 24.44 27.51 2.82 1.89 4.76 5.53 4.54 8.51-.21 2.86 1.71 7.82 4.25 11.02 3.67 4.61 5.58 5.03 9.24 2.04 2.54-2.08 4.13-5.35 3.53-7.26-.6-1.91.99-1.25 3.53 1.48l4.61 4.96-2.62-7.49c-1.44-4.12-1.32-7.66.27-7.87 3.8-.51 11.31 8.79 10.05 12.45-2.46 7.16 27.4 15.69 31.72 9.06 3.99-6.12 9.81-3.28 7.95 3.9-.85 3.28-2.43 6.08-3.5 6.22-4.14.55 7.88 9.63 13.49 10.19 5.35.53 5.87 1.23 5.43 7.32-.58 8.26-.53 18.96.14 23.92.63 4.73 15.66 11.31 22.39 9.79 7.21-1.62 13.83-11.54 11.09-16.61-1.27-2.34-5.34-5.22-9.06-6.41-3.71-1.19-7.31-3.66-8-5.51-1.51-4.05 6.03-10.81 8.59-7.69.99 1.21 2.24.96 2.76-.56.98-2.84 18.3.68 21.28 4.31 2.46 3.01-6.66 8.72-11.34 7.11-2.5-.86-1.13 1.81 3.56 6.91 4.19 4.57 9.57 8.51 11.95 8.74 6.05.61 8.82 4.72 6.24 9.26-1.22 2.12-5.66 3.48-10 3.05-4.32-.43-8.79.92-9.99 3.03-2.22 3.89 6.03 13.66 25.82 30.61 9.92 8.49 7.55 13.82-8.02 18-12.77 3.44-16.82 1.16-27.93-15.68-5.07-7.69-11.1-13.88-16.16-16.59-6.76-3.62-7.85-5.03-6.73-8.7.93-3.02-.04-2.58-3.12 1.42-3.41 4.42-6.13 5.33-11.45 3.83-8.5-2.38-10.64-7.75-8.26-20.69 1.74-9.46-2.36-19.4-6.57-15.95-1.12.91-2.71-.4-3.54-2.92-.96-2.9-1.92-3.38-2.63-1.33-2.2 6.41-10.12 6.6-13.08.32-1.57-3.35-3.74-5.2-4.94-4.22-1.17.96-.97 3.16.44 4.88 1.41 1.73 1.69 3.86.62 4.74-2.66 2.17-9.89-2.84-15.34-10.63-2.47-3.55-9.2-9.75-14.95-13.78-8.78-6.16-11.55-9.71-17.26-22.14l-6.81-14.81-8.69.17c-6.72.13-8.39-.75-7.35-3.88.88-2.66.49-3.38-1.13-2.09-2.81 2.24-11.03-13.87-11.05-21.64-.01-5.08-12.36-8.16-17.11-4.27-4.5 3.69-15.53-12.07-15.45-22.09zm-11.53-22.19a2.708 2.708 0 0 0-3.43-4.19 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm26.36 18.13c-2.08-10.47-1.62-12.52 2.97-13.04 6.23-.71 6.78-2.26 3.13-8.77-1.71-3.06-5.18-4.13-10.07-3.11-6.75 1.4-7.5 2.43-7.79 10.75-.24 6.52 1.79 11.73 6.94 17.89l7.28 8.7-2.46-12.42zm77.21 92.71c1.92-1.57 2.36-2.96.98-3.1-1.38-.14-2.49-2.37-2.47-4.97.02-2.59-.69-4.12-1.56-3.4-1.34 1.09-1.96 11.89-.8 13.75.2.32 1.93-.71 3.85-2.28zm-69.33-101.13c.12-1.17-2-1.39-4.7-.49-3.91 1.31-3.96 1.74-.22 2.13 2.59.27 4.81-.47 4.92-1.64zm104.23 109.21c3.55-.99 6.97-.18 7.63 1.8.66 1.98 1.65 2.26 2.21.63 1.49-4.32-7.41-14.22-14.4-16.03-3.82-.99-6.91.02-8.47 2.75-3.44 6.03 5.04 13.09 13.03 10.85zm58.06 48.57c1.15-.95 1.32-2.66.38-3.81a2.708 2.708 0 0 0-3.8-.38 2.72 2.72 0 0 0-.38 3.81 2.708 2.708 0 0 0 3.8.38zM1.247 117.65c-3.63-11.57 1.79-43.59 9.12-53.87 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-10.98-2.43-12.22-6.48-5.52-18.06 5.98-10.36 19.3-24.55 14.4-15.34-1.52 2.85-5.88 9.52-9.69 14.84-7.72 10.77-5.48 17.43 5.4 16.03 8.54-1.1 8.68 3.08.48 14.52-9.76 13.63-16.61 40.74-13.55 53.65 1.43 6.01 1.89 11.52 1.04 12.24-1.8 1.52-1.56 1.88-4.15-6.35zm32.5 33.51c.16-6.52-1.84-12.91-5.41-17.27-13.46-16.45-13.3-43.57.39-68.92 4.73-8.75 18.66-18.77 21.42-15.39.89 1.08 2.04.73 2.57-.78 2.91-8.47 39.67-3.12 42.55 6.18.72 2.32.25 2.5-1.49.61-3.23-3.51-16.99-3.98-20.98-.71-1.67 1.37-1.63 3.31.08 4.3 12.69 7.35 13.51 8.67 10.66 17.1-1.57 4.65-3.01 9.1-3.21 9.89-.2.78 5.02 1.47 11.6 1.54l11.96.11 1.92 18.64-6.54-5.29c-7.26-5.87-24.18-9.73-28.21-6.43-1.42 1.16-3.78 1.36-5.25.43-1.49-.94-4.31 5.29-6.41 14.15-2.61 11.01-5.34 16.46-8.97 17.9-6.17 2.46-8.37 10.62-4.21 15.7 3.5 4.27 14.99 5.31 19.34 1.74 6.91-5.66 11.9-2.08 14.03 10.07 1.63 9.23.82 12.71-3.83 16.52-3.24 2.65-6.66 3.88-7.6 2.73a2.708 2.708 0 0 0-3.8-.38c-1.15.94-.91 3.16.54 4.93 2.11 2.58 1.67 3.16-2.25 2.9-2.69-.17-6.24-2.82-7.91-5.88-1.66-3.06-6.44-6.64-10.62-7.96-9.98-3.14-10.66-4.22-10.37-16.43zm17.32 12.36c1.79-1.47 1.9-3.14.25-3.7-1.65-.57-3.89-.31-4.97.57-1.08.89-1.2 2.56-.26 3.71s3.18.89 4.98-.58zm14.08-.4c-.63-2-2.18-3.75-3.45-3.87-1.26-.13-.74 1.51 1.15 3.64 2.1 2.36 3 2.45 2.3.23zm-18.63-65.08c4.38-4.95 8.04-18.49 6.26-23.15-2.03-5.34-15.52 10.84-15.12 18.15.42 7.57 4.53 9.89 8.86 5zm34.36-24.72c.28-2.83-.76-2.43-3.5 1.33-2.22 3.05-2.39 4.78-.4 4.02 1.92-.74 3.68-3.14 3.9-5.35zm130.63 271.57c1.35-3.93 7.61-1.01 7.18 3.35-.24 2.43-1.71 2.96-4.23 1.52-2.13-1.21-3.45-3.4-2.95-4.87zM66.717 120.98c1.41-4.09 10.33-7.43 14.09-5.27 5.55 3.19 7.63 14.3 3.14 16.73-2.34 1.26-5.14 1.21-6.22-.12-1.09-1.32-3.26-2.53-4.83-2.69-4.06-.41-7.4-5.08-6.18-8.65zm115.29 131.24c6.27-3.91 7.41-6.57 3.73-8.67-3.29-1.88-2.77-2.49 3.51-4.15 10.54-2.79 15 .79 11.03 8.85-2.63 5.35-4.18 6.52-7.25 5.46-2.79-.96-3.77-.33-3.44 2.2.26 1.94-.84 3.71-2.46 3.93-4.35.58-8.47-5.54-5.12-7.62zM14.947 34.92c7.75-4.2 15.73-3.17 14.01 1.82-.66 1.93-5.42 3.04-10.72 2.52l-9.53-.95 6.24-3.39zm118.72 146.58c.63-1.82 3.19-3.29 5.7-3.27 2.51.02 4.76-1.3 5-2.92.25-1.63.73-1.22 1.08.89.35 2.12-.78 5-2.5 6.42-1.8 1.47-1.69 3.06.26 3.73 2.06.71 1.94 1.72-.31 2.58-4.68 1.79-10.72-3.07-9.23-7.43zm199.51 244.52c-3.63-5.52-3.83-8.22-.8-10.7 2.23-1.82 4.82-2.37 5.76-1.22 2.87 3.49 10.69-4.85 10.35-11.04-.22-4.07-1.89-6.46-5.56-7.98-7.92-3.29-6-5.49 4.08-4.69 9.61.77 15.39 3.84 12.18 6.47-1.08.89 1.14 4.35 4.92 7.69 5.78 5.11 6.33 6.86 3.43 10.85-3.82 5.25.32 12.41 7.58 13.14 2.51.25 3.84 1.05 2.95 1.77-.88.73.96 1.58 4.1 1.89 7.38.74 10.66-2.11 11.89-10.29.83-5.51 2.26-6.94 8.55-8.61 7.26-1.92 7.5-1.75 6.06 4.22-.82 3.42-2.55 7.12-3.83 8.23-3.23 2.8 3.05 15.27 7.93 15.76 2.19.22 8.06-2.61 13.05-6.29 5.91-4.35 7.52-6.48 4.64-6.11-6 .77-7.34-9.07-2.04-14.92 2.97-3.27 5.31-3.14 9.99.55 10.61 8.38 11.92 8.82 16.06 5.43 2.61-2.14 3-6.16 1.1-11.35-2.07-5.65-1.67-8.46 1.33-9.45 2.78-.92 3.31-2.6 1.53-4.78-3.25-3.97-4.32-3.35-7.53 4.38-1.91 4.62-2.62 5.01-3.43 1.94-.56-2.13-1.79-6-2.72-8.59-1.83-5.04 2.02-9.88 6.6-8.3 1.52.52 8.1 7.27 14.63 14.99l11.85 14.05-.04-8.11c-.03-4.46-1.07-9.36-2.33-10.89-1.25-1.53-1.79-4.19-1.2-5.91 1.48-4.29 7.93 9.68 7.31 15.84-.26 2.6-.17 5.75.2 6.99 2.17 7.37-6.15 24.36-16.83 34.37-10.52 9.86-13.15 11.02-29.27 12.91-9.73 1.15-21.28.96-25.66-.42-4.38-1.38-12.9-3-18.93-3.6-7.96-.79-11.56-2.59-13.14-6.56-2.26-5.68-24.6-14.58-28.52-11.37-3.2 2.62-10.99-2.32-16.24-10.29zM96.957 125.94c5.69-4.66 5.97-4.6 8.1 1.82 2.5 7.56-7.08 10.1-12.62 3.34-.39-.48 1.64-2.8 4.52-5.16zm63.24 72.62c3.7-6.49 14.68-14.48 15.14-11.02.23 1.73 1.43 2.32 2.65 1.32 3.03-2.48 4.33 8.15 1.88 15.38-1.52 4.48-3.35 5.3-9.84 4.42-9.57-1.3-12.9-4.71-9.83-10.1zM23.967 19.29c1.54-2.56 3.2-5.62 3.68-6.79s1.64-1.2 2.57-.06c1.97 2.41-3.69 12.04-6.88 11.72-1.19-.11-.9-2.31.63-4.87zm14.99 5.39c1.48-5.96.52-10.75-3.14-15.57-5.01-6.6-4.83-12.25.23-7.11 6.36 6.45 8.41 12.09 7.23 19.87-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.16-2.6 38.14-.98 37.92 1.75-.1 1.23-8.12 1.62-17.83.86-9.7-.76-20.87.34-24.81 2.43-8.87 4.72-11.86 1.51-9.07-9.74zm280.67 345.18c3.29-2.69 5.09-2.29 7.5 1.69 4.7 7.76-1.8 14.1-7.42 7.24-3.31-4.05-3.33-6.27-.08-8.93zm-55.71-88.22c-1.27-2.42-.79-4.78 1.07-5.24 1.86-.46 5.57-1.63 8.24-2.61 6.96-2.53 11.96 6.93 6.69 12.66-2.72 2.95-5.05 3.44-6.71 1.41-1.4-1.71-3.54-2.81-4.76-2.46-1.21.36-3.25-1.33-4.53-3.76zm174.98 190.43c15.22-3.33 21.74-6.43 36.71-17.43l18.21-13.37 3.53 6.25c1.95 3.44 4.1 8.21 4.77 10.59.68 2.38 4.11 5.08 7.62 5.99 6.3 1.63 6.41 1.52 7.64-7.84.69-5.22.27-10.68-.93-12.14-1.2-1.47-.6-6.02 1.32-10.13 4.37-9.34.32-14.87-7.4-10.1-9.92 6.12-11.96 3.69-12.66-15.12-.38-10.01-1.6-19.33-2.71-20.71-1.12-1.37-1.57-3.84-1.01-5.49 1.66-4.82 5.21 8.26 6.74 24.86 1.43 15.38 2.89 19.93 4.7 14.66 1.76-5.1 11.36-7.43 14.55-3.53 1.66 2.02 2.6 7.04 2.1 11.15-1.57 12.88-1.68 14.84-1.27 24.35.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.86-13.51-7.07-14.21-20.04-3.33-6.19 5.19-13.97 10.66-17.28 12.15-9.38 4.21-39.16 11.17-40.6 9.48-.71-.83 7.03-3.33 17.22-5.57zM114.877 95.63c-3.72-7.95-.91-14.57 7.08-16.68 9.54-2.51 15.45 6.99 10.66 17.17-2.79 5.94-4.68 7.58-8.66 7.56-2.79-.02-5.46-.72-5.92-1.55-.45-.83-1.88-3.75-3.16-6.5zm63.88 65.52c-.6-1.91-.25-4.16.77-4.99 1.02-.83 2.53.54 3.36 3.06 1.02 3.07 1.91 3.42 2.73 1.06.66-1.94 1.95-2.86 2.86-2.05 11.79 10.52 11.76 14.19-.09 10.86-7.48-2.1-7.92-2.46-9.63-7.94zm176.69 211.99c1.67-1.37 3.76-1.58 4.66-.48.9 1.1 2.13-.51 2.72-3.57.94-4.84 1.43-4.95 3.65-.83 3.43 6.35-2.01 12.35-8.69 9.58-4.11-1.71-4.66-2.8-2.34-4.7zm-136.85-168.62c-2.72-6.22-2.62-6.36 3.06-4.25 4.18 1.56 5.16 1.27 3.39-1.03-2.2-2.86-1.96-3.05 2.12-1.74 6.92 2.23 14.55 12.55 11.27 15.23-2.63 2.16-15.38 1.6-16.51-.72-.28-.58-1.78-3.95-3.33-7.49zm10.32 5.53c.51-.42.15-1.7-.79-2.85-.94-1.15-2.71-1.27-3.93-.28-1.22 1-.86 2.28.79 2.85 1.65.57 3.42.69 3.93.28zm-59.57-78.6c.53-1.54 2.34-2.33 4.02-1.75 1.68.58 2 1.91.71 2.97-1.28 1.05-.98 2.38.67 2.94 1.65.57 2.01 1.85.79 2.85-2.73 2.24-7.51-3.17-6.19-7.01zm161.68 190.43c2.03-10.47 15.02-1.53 15.36 10.56.15 5.59-.09 5.89-1.56 1.89-1.3-3.56-2.3-3.73-4.04-.68-3.13 5.49-11.22-4.27-9.76-11.77zm-11.11-33.51c3.25-5.59 10.07-5.81 15.57-.5 6.05 5.85 2.85 10.85-5.86 9.16-4.13-.8-5.16-2.08-5.13-6.35.03-4.48-.35-4.68-2.32-1.22-1.3 2.27-2.74 3.65-3.21 3.08-.47-.58-.04-2.45.95-4.17zm81.89 100.9c-.45-2.86-3.63-8.12-7.05-11.69-5.3-5.52-5.55-7.01-1.64-10.01 3.59-2.76 3.6-4.52.02-8.02-2.7-2.65-3.34-4.92-1.56-5.56 1.66-.6 5 1.74 7.41 5.19 2.87 4.09 6.62 6.1 10.85 5.78 6.84-.52 13.53 5.66 14.48 13.37.35 2.92-2.94 7.56-8.91 12.53-9.62 8.02-12.11 7.73-13.6-1.59zm14.21-6.63c-.59-1.91.25-4.57 1.88-5.9s1.6-4.06-.07-6.06c-2.58-3.11-2.95-2.94-2.48 1.16.29 2.64-.26 3.88-1.24 2.76s-1.53.12-1.23 2.76c.29 2.64 1.37 5.69 2.38 6.78 1.02 1.09 1.36.42.76-1.5zm-103.6-117.74c1.27.13 2.82 1.87 3.45 3.88.7 2.21-.2 2.12-2.3-.23-1.89-2.13-2.41-3.77-1.15-3.65zm47.13 47.09c-.47-2.9.92-5.86 3.07-6.58 5.46-1.8 19.77 7.81 22.51 15.13 1.25 3.33 3.03 6.61 3.97 7.29.93.67.79 1.97-.32 2.88-2.61 2.14-11.47-1.71-12.83-5.57-.58-1.64-3.48-3-6.44-3.02-6.19-.04-8.77-2.66-9.96-10.13zm12.13 6.52c1.73-.23 2.38-1.36 1.43-2.51-.94-1.15-3.13-1.9-4.86-1.67-1.73.23-2.38 1.36-1.44 2.51.95 1.15 3.13 1.9 4.87 1.67zm11.03 4.94c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.94-1.27 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm119.95 125.39c-.96-3.06-2.44-5.83-3.29-6.17-.85-.33.26-2.08 2.48-3.9 4.84-3.96 6.66-2.36 5.29 4.65-.55 2.84.06 6.47 1.36 8.05 1.3 1.59 1.42 3.65.27 4.6-2.43 1.98-3.7.48-6.11-7.23zm-63-89.92c-1.17-9.81 15.81-6.55 19.2 3.68 1.05 3.19-.09 4.32-5.97 5.87-7.57 2.01-12.26-1.38-13.23-9.55z',
												fill: '#a73b22',
											}),
											Object(Bt.jsx)('path', {
												d: 'M90.917 236.93c1.85-.25 2.87-2.02 2.27-3.94-.78-2.5-.46-2.83 1.12-1.14 3.18 3.4.9 8.16-3.24 6.74-2.1-.72-2.16-1.39-.15-1.66zm-24.56-35.28c1.74-.23 3.92.52 4.87 1.68.94 1.15.29 2.28-1.44 2.51-1.73.23-3.92-.52-4.86-1.67-.95-1.16-.3-2.29 1.43-2.52zm-64.42-81.76c-5.31-15.78.85-47.63 11.53-59.64l6.37-7.15-5.29 8.56c-8.15 13.2-13.33 36.81-10.99 50.13 1.17 6.62 1.71 12.37 1.21 12.78-.51.41-1.03.45-1.18.08-.14-.36-.89-2.5-1.65-4.76zm84.86 100.33c-.13-3.54-1.61-6.9-3.27-7.47-1.72-.59-1.45-1.25.62-1.53 2.32-.31 4.04 1.34 4.72 4.53.59 2.76 2.47 5.85 4.16 6.87 1.97 1.18 1.51 2.37-1.27 3.29-2.4.79-4.44 1.28-4.53 1.09-.1-.2-.29-3.25-.43-6.78zm43.5 53.11c1.72-1.41 4.38-1.04 5.91.83 2.28 2.78 1.83 3.39-2.49 3.36-2.9-.02-5.56-.39-5.91-.83-.36-.43.76-1.94 2.49-3.36zm-96.7-119.97c1.08-.88 3.32-1.15 4.98-.58 1.65.57 1.94 1.9.64 2.97-1.48 1.21-.38 3.22 2.98 5.42 12.01 7.9 12.31 8.25 5.69 6.9-7.18-1.46-17.5-12.08-14.29-14.71zm30.95 37.55c1.15-.94 2.86-.77 3.81.38.94 1.15.77 2.86-.38 3.8s-2.86.77-3.81-.38c-.94-1.15-.77-2.86.38-3.8zm8.88 5.11c-.32-5.9-.14-6.02 4.36-2.74 3.59 2.61 3.71 4.11.5 6.35-2.3 1.62-4.27 2.85-4.36 2.74-.09-.11-.31-2.97-.5-6.35zm28.51 34.15c1.73-1.41 3.88-1.66 4.8-.54.91 1.11-.2 2.64-2.47 3.39-2.26.75-4.42.99-4.79.54-.37-.45.74-1.98 2.46-3.39zm17.57 25.11c-.56-1.83.72-3.9 2.85-4.61 3.32-1.1 3.8-.52 3.34 4.06-.85 8.58-3.63 8.83-6.19.55zm31.87 34.56c.14-1.39 1.77-3.73 3.62-5.18 2.76-2.18 3.01-1.7 1.36 2.69-2.02 5.43-5.44 7.13-4.98 2.49zm-117.32-149.2c.6-1.75-.5-4.47-2.46-6.06-1.95-1.58-3.13-5.31-2.62-8.29.83-4.8.63-4.95-1.78-1.27-3.34 5.1-5.33 3.03-5.54-5.76-.09-3.66.41-5.55 1.11-4.2 3 5.82 12.23 8.65 21.97 6.76 5.76-1.12 11.16-1.21 11.99-.2 1.35 1.65-.21 2.45-11.35 5.84-1.72.53-2.39 5.69-1.5 11.48 1.48 9.61 2.09 10.5 7.04 10.23 4.38-.24 4.19.01-.99 1.32-3.95 1-6.92.06-7.75-2.46-.75-2.24-2.4-3.22-3.67-2.18-2.94 2.41-5.88-1.04-4.45-5.21zm2.8-9.16c.56-1.65.69-3.42.27-3.93-.41-.5-1.69-.15-2.84.79-1.15.95-1.28 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm10.44 24.75c1.92-1.63 4.75-2.53 6.29-2 1.55.53 5.49-2.06 8.76-5.76 4.06-4.6 7.61-6.4 11.23-5.7 4.58.89 4.32 1.74-1.95 6.35-4.74 3.49-6.33 6.07-4.6 7.48 1.46 1.19 1.7 2.93.55 3.88-1.15.94-2.86.77-3.8-.38s-3.28-.81-5.2.76c-1.92 1.57-3.37 1.74-3.24.38.14-1.37-2.4-2.38-5.63-2.26-5.46.19-5.63-.01-2.41-2.75zm35.86 43.9c1.62-1.33 4.73-.55 6.9 1.73 2.17 2.28 3.46 3.98 2.85 3.78-.61-.2-3.71-.98-6.9-1.73-4.88-1.15-5.33-1.75-2.85-3.78zm30.45 38.74c1.36-.59 2.78-5.64 3.15-11.22.69-10.47 3.5-16.46 3.44-7.34-.02 2.81 1.61 5.68 3.61 6.37 2.51.86 2.23 1.72-.93 2.77-5.92 1.96-2.46 6.24 4.74 5.85 4.97-.28 5.17.16 1.98 4.55-1.94 2.67-4.23 4-5.09 2.95-.85-1.04-2.48-.74-3.61.67-1.13 1.41-3.8 1.19-5.91-.49-2.12-1.68-2.74-3.53-1.38-4.11zm62.57 76.19c1.66.51 5.86.56 9.33.1 4.73-.62 5.16-.37 1.71 1.03-3.68 1.49-3.55 3.23.68 8.79 2.89 3.82 5.95 7.55 6.79 8.3.84.75.63 2.11-.48 3.02-1.11.9-6.29-3.72-11.53-10.27-5.23-6.55-8.16-11.48-6.5-10.97zm-75.71-101.16c1.41-1.15 1.01-2.63-.9-3.29-2.24-.77-2.08-1.38.44-1.71 2.78-.37 3.79.65 3.5 3.55-.22 2.24-1.57 3.95-3 3.81-1.43-.14-1.45-1.2-.04-2.36zm7.08 8.18c-.33-2.88.28-3.81 1.53-2.33 1.14 1.36 1.61 3.82 1.04 5.47-1.28 3.73-1.88 3.01-2.57-3.14zm35.3 40.98c1.72-1.41 3.88-1.66 4.79-.54.91 1.11-.19 2.64-2.46 3.39s-4.43.99-4.8.54c-.37-.45.74-1.98 2.47-3.39zm38.98 45.26c2.85-2.51 7.27-4.35 9.84-4.09 3.67.36 5.11-.89 6.82-5.94 1.92-5.65 2.35-5.86 3.7-1.78.84 2.54 2.39 5.67 3.44 6.96 1.41 1.72.79 2.23-2.35 1.91-5.87-.58-8.9 5.68-5.03 10.41 2.2 2.69 1.84 4.33-1.17 5.33-2.39.79-4.04.22-3.65-1.26.38-1.49.64-5.34.57-8.55-.12-5.17-1.11-5.41-8.74-2.13-7.66 3.28-8.04 3.19-3.43-.86zM80.967 186.78c.47-4.72 3.72-5.41 6.96-1.46 1.76 2.16 6.5 3.62 10.51 3.24 4.01-.38 7.17.76 7.02 2.53-.14 1.77-2.96 2.52-6.26 1.66-3.52-.91-6.51-.03-7.25 2.12-.78 2.26-1.44 2.36-1.72.25-.25-1.88-1.9-3.23-3.66-2.99-3.68.49-5.96-1.69-5.6-5.35zm92.14 107.45c2.96-2.37 3.25-2.13 1.98 1.69s-.81 4.24 3.25 2.9c6.13-2.03 8.09.43 3.39 4.27-2.33 1.91-5.19 1.36-7.87-1.54-2.8-3.01-3.05-5.47-.75-7.32zm38.4 50.66c1.35-3.93 7.61-1.01 7.18 3.35-.24 2.43-1.71 2.96-4.23 1.52-2.13-1.21-3.45-3.4-2.95-4.87zM67.197 164.28c1.16-.94 2.44-1.3 2.85-.79.42.51.29 2.27-.28 3.93-.56 1.65-1.85 2.01-2.84.79-1-1.22-.88-2.99.27-3.93zm-42.55-60.5c1.81-2.49 3.99-3.67 4.84-2.63.86 1.05-.33 3.44-2.63 5.32-2.3 1.89-4.48 3.07-4.84 2.63-.36-.44.82-2.84 2.63-5.32zm178.21 219.06c2.23-1.2 5.31-1.38 6.87-.4 1.79 1.14.92 2.66-2.41 4.18-6.2 2.85-10.3-.63-4.46-3.78zm34.27 44.7a2.7 2.7 0 0 1 3.8.38 2.7 2.7 0 1 1-3.8-.38zM19.337 91.96c4.31-7.46 6.76-7.01 4.85.9-1.82 7.56-3.91 9.84-6.33 6.89-.97-1.18-.3-4.69 1.48-7.79zm15.99 16.32c.56-1.65 2.46-1.26 4.21.88s5.21 4.09 7.69 4.34c2.47.24 4.38 1.63 4.24 3.08-.3 3.02-11.89.82-15.07-2.86-1.16-1.34-1.64-3.79-1.07-5.44zm40.24 49.15c1.15-.94 2.43-1.3 2.85-.79.41.51.29 2.27-.28 3.93-.57 1.65-1.85 2-2.85.79-.99-1.22-.87-2.99.28-3.93zm33.54 40.67c-1.4-4.37-1.14-4.83 1.23-2.17 1.65 1.85 4.8 4.39 6.99 5.64 2.18 1.24 3.03 3.03 1.88 3.98-3.1 2.53-8.09-1.15-10.1-7.45zm-33.87-47.12c2.13-1.89 3.77-2.41 3.65-1.14-.13 1.26-1.87 2.81-3.87 3.44-2.22.7-2.13-.2.22-2.3zm154 190.48c-1.18-3.69 2.51-2.31 14 5.26 8.59 5.66 15.22 11.42 14.74 12.82-.48 1.39-2.28.84-4-1.23-2.66-3.19-3.05-3.03-2.62 1.07.37 3.46-.62 2.72-3.54-2.65-2.78-5.13-5.94-7.66-10.1-8.07-3.33-.33-6.24-.96-6.46-1.4-.22-.43-1.13-3.04-2.02-5.8zm26.74 28.11c2.69-2.2 5.56-2.22 7.51-.03 1.74 1.94 4.76 4.86 6.72 6.48 1.95 1.63 2.61 4.62 1.46 6.64-1.63 2.85-3.01 2.1-6.19-3.32-2.4-4.11-4.83-6.07-5.88-4.77-.98 1.23-3.18 1.41-4.88.4-1.85-1.09-1.35-3.26 1.26-5.4zm-121-150.25c1.19-2.07 2.82-2.96 3.63-1.97s.51 3.5-.68 5.57c-1.18 2.08-2.81 2.97-3.62 1.97-.81-.99-.51-3.49.67-5.57zm12.42 17.3c1.75-.23 1.41-2.58-.77-5.28-3.07-3.8-2.96-4.53.53-3.37 2.82.93 4.44 3.13 4.42 5.98-.04 5.47-3.03 8.34-5.52 5.3-.99-1.21-.39-2.4 1.34-2.63zM35.607 95.82c-.33-2.88.28-3.81 1.53-2.33 1.14 1.35 1.6 3.81 1.03 5.47-1.28 3.73-1.87 3-2.56-3.14zm149.85 183.01c-1.57-5.45-1.49-5.5 2.27-1.19 2.14 2.45 3.43 5.81 2.86 7.46-1.22 3.56-2.89 1.51-5.13-6.27zm90.44 111.92c1.73.95 4.08 3.74 5.21 6.21 1.14 2.47-.28 1.7-3.15-1.72-2.86-3.41-3.79-5.43-2.06-4.49zm16.5 16.55c1.72-1.41 3.78-1.79 4.56-.83.79.96.02 2.9-1.71 4.31-1.72 1.42-3.78 1.79-4.56.83-.79-.96-.02-2.9 1.71-4.31zM46.907 97.9c5.12-4.83 5.34-4.76 3.93 1.15-.83 3.45-2.71 6.43-4.19 6.62-5.21.7-5.1-2.72.26-7.77zm165.85 208.81c1.83.19 5.21 3.31 7.5 6.95 3.84 6.1 3.58 6.07-3.33-.33-4.31-3.98-6.09-6.81-4.17-6.62zm74.99 90.2c1.26.13 2.81 1.87 3.45 3.87.7 2.22-.21 2.13-2.3-.22-1.9-2.13-2.41-3.77-1.15-3.65zM32.457 79.18c1.22-3.55 6.65-4.69 8.95-1.88.88 1.08-.28 3.51-2.58 5.39-4.41 3.62-8.12 1.57-6.37-3.51zm23.83 20.81c1.96-7.2 3.3-9.02 5.06-6.86 2.58 3.15-2.09 17.21-5.6 16.86-1.17-.11-.93-4.61.54-10zm10.51 20.76c.62-1.8 3.19-2.98 5.72-2.63 3.51.5 3.69.8.76 1.31-2.35.41-2.79 1.92-1.15 3.93 3.66 4.46 9.12-.57 6.6-6.07-1.13-2.45.48-1.59 3.56 1.91 4.21 4.76 4.79 7.49 2.33 10.87-2.44 3.35-4.14 3.49-6.56.53-1.79-2.19-4.2-3.21-5.35-2.27-2.81 2.3-7.32-3.48-5.91-7.58zm141.74 175.86c.51-.42 2.28-.29 3.93.28 1.65.57 2.01 1.85.79 2.84-1.22 1-2.98.88-3.93-.27-.94-1.15-1.29-2.44-.79-2.85zM3.217 39.97c-.13-1.75 1.66-6.64 3.97-10.86 3.34-6.12 3.84-6.52 2.46-1.95-4.99 16.56-5.24 15.77 4.89 16.07 8.96.26 12.62 3.6 8.06 7.34-1.15.94-2.27.39-2.48-1.22-.22-1.61-1.83-2.74-3.58-2.51-5.13.69-13.07-3.41-13.32-6.87zm289.93 353.32c1.74-.23 3.88.46 4.76 1.55.89 1.08.67 2.73-.48 3.68-1.15.94-3.29.24-4.76-1.55-1.47-1.8-1.25-3.45.48-3.68zm11.27 7.36c3.38-2.76 6.27-3.11 8.16-1 2.25 2.52 2.55 1.96 1.31-2.38-1.33-4.61-1.07-5.02 1.41-2.24 4.1 4.61 2.37 8.54-5.35 12.18-8.26 3.89-12.36-.96-5.53-6.56zm-121.35-146.07c-.44-3.86.24-3.86 3.45.01 2.22 2.67 2.59 4.98.83 5.22-3.79.5-3.61.72-4.28-5.23zm50.59 59.9c.5-.42 2.27-.29 3.92.28 1.66.56 2.01 1.85.8 2.84-1.22 1-2.99.88-3.93-.27-.94-1.16-1.3-2.44-.79-2.85zm42.1 37.3c7.12-8.17 11.53-11.06 12.59-8.26.36.92 3.86 1.84 7.78 2.03 3.93.2 8.23 1.69 9.56 3.32 3.23 3.94-6.59 9.8-11.35 6.76-3.08-1.97-2.76-2.29 2.23-2.27 4.94.02 5.47-.42 3.47-2.84-1.3-1.57-6.42-2.17-11.37-1.33-7.81 1.34-9.01 2.21-9.04 6.61-.03 4.13.41 4.31 2.32.94 3.41-5.96 4.79-2.76 3.34 7.74-1.45 10.51.47 13.6 11.31 18.24 4.29 1.83 6.45 3.51 4.79 3.73-1.66.23-1.69 2.16-.07 4.31 2.63 3.49 2.39 3.61-2.27 1.19-7.2-3.73-18.38-17.28-17.17-20.8.64-1.85-1.29-4.2-5.35-6.53-3.49-2.01-6.61-3.97-6.94-4.37-.32-.4 2.45-4.21 6.17-8.47zM13.667 35.72c3.07-1.4 6.25-1.72 7.09-.7.83 1.01 3.11.53 5.07-1.07 2.61-2.14 3.44-1.79 3.13 1.34-.31 3.13-3.12 4.08-10.64 3.62-9.28-.57-9.71-.86-4.65-3.19zm18.12 23.57c1.16-2.03 3.12-3.34 4.35-2.92 1.24.43.55 2.4-1.53 4.39-4.51 4.29-5.74 3.65-2.82-1.47zm23.07 23.52c2.44-4.94 2.12-7.8-1.14-10.34-2.48-1.93-5.26-6.04-6.19-9.13-1.39-4.65-.7-4.47 4.04 1.07 3.14 3.67 6.55 5.99 7.58 5.15 1.02-.84 3.66-.51 5.85.74 2.55 1.45 2.76 2.7.59 3.46-1.87.66-5.44 4.94-7.93 9.52-5.36 9.83-7.67 9.44-2.8-.47zm-14.55-16.1c2.21.22 4.61 1.97 5.35 3.89.76 1.99-.97 1.82-4.02-.4-3.76-2.74-4.16-3.78-1.33-3.49zm149.9 172.43c6.55-1.73 7.01-1.46 4.65 2.76-3.91 6.99-4.32 7.14-8.27 2.99-3.23-3.4-2.83-4.04 3.62-5.75zm37.19 52.51c1.15-.94 2.86-.77 3.8.38.95 1.15.78 2.86-.37 3.8a2.71 2.71 0 0 1-3.81-.37 2.72 2.72 0 0 1 .38-3.81zm113.03 138.04c1.15-.94 3.68.23 5.62 2.6 1.94 2.36 2.11 4.49.37 4.72-1.73.23-4.26-.93-5.61-2.59-1.36-1.66-1.53-3.79-.38-4.73zm-7.47-12.81c.72-2.1 2.34-3.71 3.6-3.58 3.4.34 2.32 4.63-1.54 6.11-2.71 1.03-3.11.53-2.06-2.53zm6.34 3.54c1.3-3.14 4.22-7.23 6.47-9.07 2.25-1.85 3.48-5.21 2.73-7.48-.75-2.27-.15-5.1 1.34-6.29 1.8-1.44 2.38-1.03 1.72 1.21-.54 1.86-.29 5.38.55 7.82.93 2.67-1.32 7.44-5.64 11.99-8.6 9.03-10.35 9.48-7.17 1.82zm-196.96-243.13c1.68-1.37 3.2-1.31 3.4.13.19 1.45-.54 3.35-1.62 4.24-1.08.89-2.61.83-3.4-.13-.78-.96-.05-2.87 1.62-4.24zm18.35 22.28c1.05-5.4 8.18-9.26 10.92-5.92.88 1.08-.68 3.01-3.47 4.29-5.65 2.59-4.36 5.93 2.56 6.62 2.48.24 4.38 1.63 4.24 3.08-.25 2.46-11.57 1.11-14.1-1.68-.63-.7-.7-3.57-.15-6.39zM16.087 14.84c6.09-4.98 7.3-4.97 4.45.03-1.06 1.86-3.72 3.61-5.91 3.91-2.55.34-2.02-1.08 1.46-3.94zm52.96 72.14c-1.08-3.48 5.87-7.14 8.19-4.32.73.89-.15 3.66-1.96 6.14-3.32 4.56-4.36 4.26-6.23-1.82zM44.807 51.6c.57-1.66 1.85-2.01 2.85-.8 1 1.22.87 2.99-.28 3.93s-2.43 1.3-2.84.79c-.42-.5-.29-2.27.27-3.92zM274.437 330c1.48-1.22 4.73-.73 7.22 1.08 2.79 2.03 3.49 4.13 1.82 5.49-1.48 1.22-4.73.73-7.22-1.08-2.79-2.03-3.49-4.13-1.82-5.49zM85.987 88.75c6.76-1.17 11.29-.33 12.79 2.37 1.37 2.48 2.77 2.88 3.42.98 1.78-5.19 2.35-2.35 1.03 5.09-1.19 6.67-1.36 6.66-5.13-.42-2.7-5.09-4.51-6.5-5.92-4.63-1.12 1.48-5.33 1.74-9.35.56l-7.32-2.14 10.48-1.81zm268.68 331.66c-.26-4.96.5-4.76 5.87 1.52 6.44 7.52 6.02 11.3-.82 7.4-5.05-2.88-4.7-2.26-5.05-8.92zM39.417 23.43c1.58-7.21.7-11.72-3.23-16.57-3.85-4.75-4.17-6.26-1.11-5.24 5.73 1.9 9.55 13.57 7.51 22.95-1.37 6.29-.9 7.33 3.15 6.87 3.77-.42 3.73.19-.21 2.95-6.68 4.68-8.74.99-6.11-10.96zm33.93 50.22c.57-1.66 1.85-2.01 2.85-.79 1 1.22.87 2.98-.28 3.92-1.15.95-2.43 1.3-2.85.79-.41-.5-.29-2.27.28-3.92zm246.34 302.28c1.75.96 3.68 3.31 4.28 5.23.59 1.91-.84 1.12-3.2-1.75-2.35-2.88-2.84-4.44-1.08-3.48zm50.71 58.57c-.35-6.27 3.19-7.82 8.09-3.55 1.39 1.21 4.54 3.3 6.99 4.65 3.02 1.66 3.5 3.26 1.47 4.92-1.65 1.35-4.28.75-5.84-1.34-1.55-2.09-3.77-3.03-4.92-2.08-1.15.94-1.28 2.22-.28 2.85 2.47 1.56.56 2.86-2.6 1.77-1.41-.49-2.72-3.73-2.91-7.22zM66.467 63.56c.45-.37 2.58.33 4.72 1.56 2.24 1.27 2.58 2.4.79 2.64-2.99.4-7.21-2.81-5.51-4.2zm13.74 11.89c3.6-6.32 5.45-6.84 3.23-.9-1.1 2.94-2.8 5.27-3.78 5.17-.98-.1-.74-2.02.55-4.27zm-20.78-27.09c1.08-.88 3.3-1.15 4.94-.59 1.7.59 1.15 1.63-1.3 2.44-4.76 1.57-6.65.62-3.64-1.85zm227.63 275.83c.63-3.84 1.57-4.43 4.46-2.78 2.01 1.15 3.3 2.38 2.85 2.75-.44.36-1.83 2.45-3.07 4.64-2.77 4.86-5.35 2.06-4.24-4.61zm34.58 44.02c1.12-.91 3.19-.25 4.6 1.48 1.41 1.73 2.2 3.44 1.75 3.81-.46.37-2.52-.29-4.6-1.48-2.07-1.18-2.86-2.9-1.75-3.81zm18.99 21.52c5.35-1.77 11.76 2.22 8.22 5.12-1.57 1.28-4.64 1.31-6.83.06-5.64-3.22-5.78-3.73-1.39-5.18zM71.587 52.65c2.13-1.89 3.77-2.41 3.65-1.15-.13 1.27-1.87 2.82-3.88 3.45-2.21.7-2.12-.2.23-2.3zm-18.36-23.67c2.61-2.13 37.65-.43 37.45 1.83-.1 1.05-8.96 1.4-19.7.77-10.74-.63-18.73-1.8-17.75-2.6zm311.44 379.12c.57-1.66 2.24-1.54 3.71.25 1.46 1.79 1.72 4.03.57 4.97-1.15.95-2.81.83-3.7-.25-.89-1.08-1.15-3.32-.58-4.97zm72.95 64.92c14.66-2.55 20.11-5.06 35.45-16.33 15.67-11.52 18.75-12.9 22.82-10.26 2.58 1.69 4.54 4.66 4.34 6.61-.22 2.19-1.78 1.67-4.09-1.37-3.51-4.62-4.78-4.18-20.96 7.26-12.91 9.12-21.62 13.19-34.72 16.2-9.62 2.21-18.09 3.32-18.82 2.46-.74-.85 6.46-2.91 15.98-4.57zm-174.21-196.88c3.5-2.87 7.41.13 5.2 4-1.3 2.28-3.13 2.55-4.65.69-1.39-1.69-1.63-3.8-.55-4.69zm126.73 154.78c1.08-.89 3.32-1.15 4.97-.58 1.66.57 1.54 2.23-.25 3.7-1.8 1.47-4.03 1.73-4.98.58-.94-1.15-.82-2.82.26-3.7zm13.7 14.3c.51-3.7 1.62-3.99 5.23-1.37 3.77 2.75 5.88 2.06 12.01-3.9 7.32-7.13 7.93-7.08 13.07 1.22 1.39 2.24.96 2.62-1.88 1.68-2.03-.66-7.78 1.69-12.8 5.24-5.01 3.54-9.27 5.22-9.47 3.73-.2-1.49-1.82-2.53-3.59-2.3-2.08.26-2.99-1.26-2.57-4.3zM80.507 45.68c3.41.34 6.68 1.91 7.26 3.48.58 1.57-2.21 1.29-6.2-.62-6.71-3.21-6.79-3.43-1.06-2.86zm33.93 39.74c.59-3.96 1.69-6.46 2.44-5.54.75.91.81 4.34.12 7.61-1.13 5.42-.88 5.44 2.83.25l4.07-5.69-.37 8.6c-.21 4.73 1.17 9.52 3.06 10.64 2.1 1.26 2.05 2.23-.13 2.52-5.77.77-13.19-10.59-12.02-18.39zm163.67 199.64c1.22-.99.66-2.35-1.25-3-2.31-.8-2.07-1.38.7-1.75 3.14-.42 2.98-1.24-.63-3.31-3.46-1.99-3.65-2.65-.66-2.36 5.2.49 8.14 8.76 4.26 11.94-1.61 1.32-3.3 1.92-3.77 1.34-.48-.57.14-1.86 1.35-2.86zm140.45 168c2.57-2.1 4.84-2.52 5.06-.94.21 1.58 1.76 2.35 3.46 1.71 1.69-.65 3.65.33 4.35 2.18.85 2.22-1.89 2.93-8.13 2.11l-9.41-1.23 4.67-3.83zm-62.7-79.19c2.27-.75 4.91-.41 5.86.76 1.01 1.22-.49 2.11-3.53 2.09-2.89-.02-5.53-.37-5.86-.76-.32-.4 1.26-1.34 3.53-2.09zm-168.33-211.78c-1.77-5.01-1.65-5.12 2.8-2.58 2.55 1.46 4.48 4.22 4.29 6.14-.49 4.91-4.9 2.7-7.09-3.56zm39.71 49.34c1.15-.95 4.42-1.26 7.26-.71 2.89.56 4.25 1.76 3.08 2.72-1.15.94-4.42 1.26-7.26.7-2.89-.56-4.25-1.76-3.08-2.71zm169.27 203.79c.79-.65 4.24-1.73 7.66-2.41 5-.98 5.95-.39 4.83 2.98-1.63 4.92-5.29 8.56-4.92 4.91.13-1.38-1.84-2.91-4.38-3.4-2.55-.5-3.98-1.43-3.19-2.08zM129.177 82.09c-.47-4.13-.14-4.31 2.38-1.29 1.62 1.93 2.47 4.87 1.9 6.52-1.31 3.8-3.57 1.03-4.28-5.23zm40.24 49.15c1.31-3.8 3.58-1.03 4.29 5.23.46 4.13.13 4.31-2.39 1.29-1.61-1.93-2.46-4.87-1.9-6.52zM437.937 444c1.01-7.7 1.54-8.46 2.94-4.24 1.47 4.44 2.37 4.35 6.61-.73 3.39-4.05 7.12-5.65 12.07-5.15 8.34.83 10.32-.13 6.59-3.19-2.49-2.05 4.32-7.82 8.76-7.43 6.7.59-12.95 29.23-20.76 30.27-1.8.25-4.19-1.83-5.29-4.61-1.42-3.56-3.01-4.22-5.41-2.26-1.87 1.53-2.19 3.2-.71 3.71 1.48.51 1.72 2.62.54 4.68-3.43 6.02-6.69-.74-5.34-11.05zm20.42-2.56c1.15-.94 1.27-2.71.28-3.93-1-1.22-2.28-.86-2.85.79-.57 1.66-.69 3.42-.28 3.93.42.51 1.7.15 2.85-.79zm-125.9-124.01c1.81-1.49 11.72 3.97 11.48 6.33-.07.74-3.08-.06-6.69-1.78-3.6-1.71-5.76-3.76-4.79-4.55zm72.15 75.43c.57-1.65 1.85-2 2.85-.79.99 1.22.87 2.99-.28 3.93s-2.43 1.3-2.85.79c-.41-.51-.29-2.27.28-3.93zm22.83 21.49c1.73-1.41 3.44-2.2 3.81-1.75.37.45-.29 2.52-1.48 4.6-1.18 2.07-2.9 2.86-3.81 1.74-.91-1.11-.24-3.18 1.48-4.59zm-22.28-32.55c4.32-1.8 5.15-3.3 3.17-5.72-1.47-1.81-1.6-4.17-.27-5.26 1.37-1.12-.7-2.45-4.79-3.06-9.61-1.45-6.78-3.37 4.47-3.04 10.08.3 15.81 5.83 16.19 15.61.21 5.52-.19 6.02-2.54 3.16-1.54-1.88-2.33-4.76-1.76-6.42 1.38-4-5.02-11.61-7.83-9.31-1.22 1-.58 2.44 1.43 3.2 2 .76 2.23 1.31.51 1.22-1.72-.09-2.62 2.48-1.99 5.72 1.05 5.38.56 5.91-5.65 6.12-6.67.23-6.68.19-.94-2.22zm32.32 40.53c1.41-2.47 2.87-4.31 3.25-4.1.38.22 5.02 2.11 10.32 4.2 9.39 3.71 9.49 3.84 4.08 4.99-3.04.65-6.37 2.56-7.39 4.26-1.01 1.69-2.72 2-3.8.69-1.07-1.32-.54-2.58 1.19-2.81 5.28-.71 1.14-3.37-4.72-3.05-5.04.28-5.28-.06-2.93-4.18zm-105.4-136.03c.9-.74 3.18.54 5.06 2.84 1.89 2.3 2.69 4.79 1.79 5.53-.91.74-3.19-.54-5.07-2.84-1.89-2.3-2.69-4.79-1.78-5.53zm58.22 67.62c1.11-.91 3.18-.25 4.59 1.48 1.42 1.72 2.2 3.44 1.75 3.81-.45.37-2.52-.3-4.59-1.48-2.08-1.18-2.86-2.9-1.75-3.81zm-31-46.21c.58-1.71 1.62-1.15 2.43 1.29 1.58 4.76.62 6.65-1.84 3.65-.89-1.09-1.15-3.31-.59-4.94zm12.38 11.4c3.76-1.72 4.25-3.73 1.97-8-2.05-3.83-1.29-3.42 2.32 1.26 5.67 7.34 3.79 11.59-4.4 10-4.01-.78-3.99-1.38.11-3.26zm8.49 8.16c.44-.35 3.43-.05 6.66.67 5.32 1.18 5.3 1.32-.14 1.43-5.72.12-8.24-.69-6.52-2.1zm79.29 82.7c4.37 3.19 11.08-.58 7.92-4.45-1.1-1.34-.99-2.34.25-2.22 1.24.13 3.2 2.63 4.37 5.56 2 5.02 1.72 5.32-4.81 5.17-3.82-.08-8.01-1.68-9.31-3.54-1.77-2.53-1.37-2.66 1.58-.52zm44.44 52.78c8.89 4.89 15.31 1.45 14.25-7.64-.5-4.26-.16-13.36.74-20.23 1.87-14.19-3.87-20.93-10.21-12.01-3.02 4.25-3.36 4.27-1.98.11 4.18-12.51 17.04-6.88 15.38 6.73-1.57 12.88-1.68 14.84-1.27 24.35.22 5.11-1.38 10.75-3.56 12.53-4.01 3.29-13.17 1.05-17.03-4.17-1.17-1.57.49-1.42 3.68.33zm-54.12-70.19c1.15-.94 2.43-1.3 2.85-.79.41.51.29 2.28-.28 3.93-.57 1.65-1.85 2.01-2.85.79-.99-1.22-.87-2.99.28-3.93zm28.46 17.69c1.47-8.25 4.67-5.89 3.8 2.81-.66 6.62-1.71 8.27-3.72 5.82-.73-.89-.77-4.78-.08-8.63zm24.52 31.77c.86-8.7 3.1-9.27 2.67-.69-.2 4-.68 7.55-1.08 7.87-1.55 1.27-2.16-1.47-1.59-7.18zm-57.23-78.95c1.38-2.41 2.37-3.1 2.22-1.53-.16 1.57 2.65 2.28 6.23 1.57 4.26-.84 6.11-.1 5.34 2.13-.64 1.88-2.03 2.36-3.08 1.07-1.06-1.28-2.33-1.14-2.83.33-.51 1.46-3.05 2.25-5.65 1.74-3.66-.71-4.17-1.91-2.23-5.31zm52.79 59.62c2.23-1.82-1.06-31.77-3.92-35.71-1.64-2.26-1.38-2.55 1.07-1.21 1.77.98 4.02 9.68 4.99 19.34 1.81 18.05 1.12 25.12-2.06 21.22-1-1.22-1.04-2.85-.08-3.64zm-53.21-69.97c1.73-.23 3.92.52 4.86 1.67.94 1.15.29 2.28-1.44 2.51-1.73.23-3.92-.52-4.86-1.67-.94-1.15-.3-2.28 1.44-2.51z',
												fill: '#a53a1b',
											}),
										],
									}),
								}),
							},
						),
					);
				});
			($t.displayName = 'SausageIcon'), ($t.muiName = 'SvgIcon');
			var en = $t,
				tn = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								className: 'disabled' in e && !0 === e.disabled ? 'greyscale' : void 0,
								children: Object(Bt.jsxs)('svg', {
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 512.016 512.016',
									children: [
										Object(Bt.jsxs)('g', {
											fill: '#4caf50',
											children: [
												Object(Bt.jsx)('path', {
													d: 'M432 112.008c-6.464 0-12.576-3.968-14.976-10.368-3.136-8.288 1.056-17.504 9.344-20.608 40.512-15.2 54.368-53.888 54.496-54.272 2.944-8.352 12.192-12.768 20.384-9.856 8.352 2.912 12.736 12 9.888 20.352-.768 2.176-19.104 53.344-73.504 73.728a15.769 15.769 0 01-5.632 1.024z',
												}),
												Object(Bt.jsx)('path', {
													d: 'M496 176.008c-6.592 0-12.768-4.096-15.104-10.688-.416-1.12-14.88-39.456-54.528-54.336-8.288-3.104-12.48-12.32-9.344-20.608 3.104-8.288 12.384-12.448 20.608-9.344 54.4 20.416 72.704 71.552 73.504 73.728 2.88 8.352-1.536 17.44-9.888 20.352a15.736 15.736 0 01-5.248.896z',
												}),
											],
										}),
										Object(Bt.jsx)('path', {
											d: 'M336 134.376c-8.832 0-16 7.168-16 16v89.6c0 17.664-14.336 32-32 32h-16v-112c0-8.832-7.168-16-16-16s-16 7.168-16 16v112h-16c-17.632 0-32-14.336-32-32v-89.6c0-8.832-7.168-16-16-16s-16 7.168-16 16v89.6c0 35.296 28.704 64 64 64h16v176.032c0 8.832 7.168 16 16 16s16-7.168 16-16V303.976h16c35.296 0 64-28.704 64-64v-89.6c0-8.832-7.168-16-16-16z',
											fill: '#cfd8dc',
										}),
										Object(Bt.jsx)('path', {
											d: 'M368 16.008c-3.008 0-5.984.064-8.608.48L43.168 48.232v.16C18.56 50.856 0 71.336 0 96.008s18.56 45.152 43.168 47.616l315.872 31.872c2.72.448 5.792.512 8.96.512 44.128 0 80-35.904 80-80s-35.872-80-80-80z',
											fill: '#ff9800',
										}),
										Object(Bt.jsx)('g', {
											fill: '#ffd54f',
											children: Object(Bt.jsx)('path', {
												d: 'M122.048 78.856c1.952.8 3.968 1.152 5.952 1.152 6.336 0 12.352-3.808 14.848-10.048 4.192-10.496 7.36-21.536 9.888-32.736l-34.56 3.488c-1.664 5.792-2.816 11.808-5.024 17.344-3.296 8.192.704 17.504 8.896 20.8zM202.016 78.856c1.984.768 4 1.152 5.984 1.152 6.336 0 12.352-3.808 14.848-10.016 5.344-13.344 8.832-26.976 11.392-40.928l-33.088 3.296c-2.08 8.704-4.608 17.248-8 25.664-3.296 8.224.704 17.536 8.864 20.832zM298.912 22.568c-2.08 12-5.024 23.872-9.728 35.392-3.328 8.192.608 17.536 8.8 20.864 1.952.8 4 1.184 6.016 1.184 6.304 0 12.288-3.744 14.816-9.952 6.72-16.448 10.432-33.504 12.64-50.784l-32.544 3.296z',
											}),
										}),
									],
								}),
							},
						),
					);
				});
			(tn.displayName = 'VegoIcon'), (tn.muiName = 'SvgIcon');
			var nn,
				an,
				on,
				cn,
				sn,
				rn,
				ln,
				dn,
				pn,
				un,
				mn,
				jn,
				fn,
				hn,
				bn,
				On,
				xn,
				gn,
				yn = tn,
				vn = wt.a.div(
					nn ||
						(nn = Object(Ct.a)([
							'\n  display: -ms-flex;\n  display: -webkit-flex;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  padding: 10px;\n  box-shadow: rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px;\n  border-radius: 2px;\n',
						])),
				),
				zn = wt.a.div(an || (an = Object(Ct.a)(['\n  width: 100%;\n']))),
				Cn = wt.a.div(
					on ||
						(on = Object(Ct.a)([
							'\n  display: -ms-flex;\n  display: -webkit-flex;\n  display: flex;\n  align-items: center;\n',
						])),
				),
				wn = wt.a.div(
					cn ||
						(cn = Object(Ct.a)(['\n  width: 13%;\n  min-width: 30px;\n  max-width: 40px;\n  margin-bottom: 7px;\n'])),
				),
				_n = Object(wt.a)(Pt.b)(sn || (sn = Object(Ct.a)(['\n  background-color: ', ' !important;\n'])), Ie.grey500),
				Sn = wt.a.div(
					rn ||
						(rn = Object(Ct.a)([
							'\n  width: 87%;\n  margin-bottom: 7px;\n  font-size: 14px;\n  color: ',
							';\n  display: inline-block;\n\n  & > svg {\n    vertical-align: middle;\n  }\n\n  & > span {\n    vertical-align: middle;\n  }\n',
						])),
					Ie.grey500,
				),
				En = wt.a.div(
					ln ||
						(ln = Object(Ct.a)([
							'\n  flex-grow: 1;\n  svg {\n    padding-left: 5px;\n    padding-right: 5px;\n    padding-bottom: 5px;\n  }\n',
						])),
				),
				kn = wt.a.div(
					dn || (dn = Object(Ct.a)(['\n  font-weight: 550;\n  text-transform: uppercase;\n  margin-bottom: 5px;\n'])),
				),
				Tn = wt.a.div(
					pn ||
						(pn = Object(Ct.a)([
							'\n  font-weight: 400;\n  font-size: 14px;\n  color: ',
							';\n  text-transform: uppercase;\n  margin-bottom: 15px;\n',
						])),
					Ie.grey500,
				),
				Pn = wt.a.div(un || (un = Object(Ct.a)(['\n  font-weight: 550;\n  margin-bottom: 10px;\n']))),
				Mn = wt.a.div(
					mn ||
						(mn = Object(Ct.a)([
							'\n  font-size: 14px;\n  margin-bottom: 5px;\n\n  text-overflow: ellipsis;\n  overflow: hidden;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  line-clamp: 2;\n  -webkit-box-orient: vertical;\n  box-orient: vertical;\n  white-space: normal;\n',
						])),
				),
				Rn = wt.a.div(jn || (jn = Object(Ct.a)(['\n  font-size: 14px;\n  margin-bottom: 5px;\n']))),
				An = wt.a.div(fn || (fn = Object(Ct.a)(['\n  width: 87%;\n  margin-bottom: 7px;\n  font-size: 14px;\n']))),
				In = wt.a.div(
					hn ||
						(hn = Object(Ct.a)([
							'\n  font-size: 14px;\n  margin-bottom: 7px;\n\n  & > svg {\n    vertical-align: middle;\n    margin-right: 5px;\n  }\n\n  & > span {\n    vertical-align: middle;\n  }\n',
						])),
				),
				Ln = wt.a.div(bn || (bn = Object(Ct.a)(['\n  width: 25%;\n  max-width: 55px;\n']))),
				Fn = wt.a.div(
					On ||
						(On = Object(Ct.a)([
							'\n  width: 75%;\n  font-size: 14px;\n  margin-bottom: 0px;\n  display: inline-block;\n\n  & > svg {\n    vertical-align: middle;\n  }\n\n  & > span {\n    vertical-align: middle;\n  }\n',
						])),
				),
				Nn = wt.a.div(xn || (xn = Object(Ct.a)(['\n  margin: auto 0 auto auto;\n']))),
				Dn = wt.a.div(
					gn ||
						(gn = Object(Ct.a)(['\n  margin: auto 0 5px auto;\n\n  & svg {\n    margin-left: 0px !important;\n  }\n'])),
				);
			function Un(e) {
				var t,
					n,
					a,
					o,
					c,
					s = e.pollingPlace,
					r = e.election,
					i = e.showFullCardDefault,
					l = e.showMoreLessButton,
					d = e.showCopyLinkButton,
					p = e.onClickCopyLink,
					u = yt.useState(i),
					m = Object(le.a)(u, 2),
					j = m[0],
					f = m[1],
					h = function () {
						return f(!j);
					},
					b = [],
					O = (function (e) {
						if (null === e.stall || null === e.stall.noms) return '';
						var t = [];
						return (
							e.stall.noms.bbq && t.push('sausage sizzle'),
							e.stall.noms.cake && t.push('cake stall'),
							'bacon_and_eggs' in e.stall.noms && e.stall.noms.bacon_and_eggs && t.push('bacon and egg burgers'),
							'vego' in e.stall.noms && e.stall.noms.vego && t.push('savoury vegetarian options'),
							'halal' in e.stall.noms && e.stall.noms.halal && t.push('halal options'),
							'coffee' in e.stall.noms && e.stall.noms.coffee && t.push('coffee'),
							t.join(', ')
						);
					})(s);
				('' !== O && b.push(O), null !== s.stall && 'free_text' in s.stall.noms && null !== s.stall.noms.free_text) &&
					b.push(null === (c = s.stall) || void 0 === c ? void 0 : c.noms.free_text);
				return Object(Bt.jsxs)(vn, {
					children: [
						Object(Bt.jsxs)(zn, {
							children: [
								null !== s.stall &&
									Object(Bt.jsxs)(En, {
										children: [
											s.stall.noms.bbq && Object(Bt.jsx)(en, {}),
											s.stall.noms.cake && Object(Bt.jsx)(qt, {}),
											s.stall.noms.vego && Object(Bt.jsx)(yn, {}),
											s.stall.noms.nothing && Object(Bt.jsx)(Zt, {}),
											s.stall.noms.halal && Object(Bt.jsx)(Xt, {}),
											s.stall.noms.coffee && Object(Bt.jsx)(Kt, {}),
											s.stall.noms.bacon_and_eggs && Object(Bt.jsx)(Vt, {}),
										],
									}),
								H(r) &&
									!1 === $e(s) &&
									Object(Bt.jsxs)(Cn, {
										children: [
											Object(Bt.jsx)(wn, {
												children: Object(Bt.jsx)(_n, { icon: Object(Bt.jsx)(Rt.ActionHelp, {}), size: 30 }),
											}),
											Object(Bt.jsx)(Sn, { children: 'There are no reports for this booth yet' }),
										],
									}),
							],
						}),
						Object(Bt.jsxs)(zn, {
							children: [
								Object(Bt.jsx)(kn, {
									children: null !== s.premises ? ''.concat(s.name, ', ').concat(s.premises) : s.name,
								}),
								Object(Bt.jsx)(Tn, { children: s.address }),
								null !== s.stall &&
									!0 === s.stall.noms.run_out &&
									Object(Bt.jsxs)(Cn, {
										children: [
											Object(Bt.jsx)(wn, {
												children: Object(Bt.jsx)(Pt.b, {
													icon: Object(Bt.jsx)(Rt.AlertWarning, {}),
													size: 30,
													backgroundColor: Ie.yellow600,
												}),
											}),
											Object(Bt.jsx)(An, {
												children: "We've had reports that the stalls at this polling booth have run out of food!",
											}),
										],
									}),
								null !== s.stall &&
									!1 === j &&
									Object(Bt.jsxs)(yt.Fragment, {
										children: [
											Object(Bt.jsx)(Pn, { children: null === (t = s.stall) || void 0 === t ? void 0 : t.name }),
											Object(Bt.jsx)(Mn, { children: null === (n = s.stall) || void 0 === n ? void 0 : n.description }),
										],
									}),
								null !== s.stall &&
									!0 === j &&
									Object(Bt.jsxs)(yt.Fragment, {
										children: [
											Object(Bt.jsx)(Pn, { children: null === (a = s.stall) || void 0 === a ? void 0 : a.name }),
											Object(Bt.jsx)(Rn, { children: null === (o = s.stall) || void 0 === o ? void 0 : o.description }),
										],
									}),
								null !== s.stall &&
									'' !== s.stall.website &&
									Object(Bt.jsx)(Dn, {
										children: Object(Bt.jsx)(Pt.e, {
											href: s.stall.website,
											target: '_blank',
											label: "Go to this stall's website",
											secondary: !0,
											icon: Object(Bt.jsx)(Rt.SocialPublic, {}),
										}),
									}),
								H(r) &&
									!1 === $e(s) &&
									Object(Bt.jsxs)(Cn, {
										children: [
											Object(Bt.jsx)(wn, {
												children: Object(Bt.jsx)(Pt.b, {
													icon: Object(Bt.jsx)(Rt.PlacesCasino, {}),
													size: 30,
													backgroundColor: tt(s),
												}),
											}),
											Object(Bt.jsx)(An, { children: nt(s) }),
										],
									}),
								!0 === et(s) &&
									!0 === j &&
									Object(Bt.jsxs)(In, {
										children: [
											Object(Bt.jsx)(Rt.MapsRestaurant, {}),
											' ',
											Object(Bt.jsx)('span', { children: b.join(', ') }),
										],
									}),
								!0 === j &&
									null !== s.stall &&
									null !== s.stall.extra_info &&
									s.stall.extra_info.length > 0 &&
									Object(Bt.jsxs)(In, {
										children: [
											Object(Bt.jsx)(Rt.ActionInfoOutline, {}),
											' ',
											Object(Bt.jsx)('span', { children: s.stall.extra_info }),
										],
									}),
								!0 === ct(s) &&
									Object(Bt.jsxs)(In, {
										children: [
											Object(Bt.jsx)(Rt.MapsDirections, {}),
											' ',
											Object(Bt.jsxs)('span', { children: ['Entrance: ', st(s)] }),
										],
									}),
								!0 === at(s) &&
									!0 === j &&
									Object(Bt.jsxs)(In, {
										children: [
											Object(Bt.jsx)(Rt.ActionAccessible, {}),
											' ',
											Object(Bt.jsxs)('span', { children: ['Wheelchair Access: ', ot(s)] }),
										],
									}),
								s.divisions.length > 0 &&
									!0 === j &&
									Object(Bt.jsxs)(In, {
										children: [
											Object(Bt.jsx)(Rt.EditorFormatListBulleted, {}),
											' ',
											Object(Bt.jsxs)('span', {
												children: ['Division', s.divisions.length > 1 ? 's' : '', ': ', s.divisions.join(', ')],
											}),
										],
									}),
								null !== s.stall &&
									'' !== s.stall.opening_hours &&
									!0 === j &&
									Object(Bt.jsxs)(In, {
										children: [
											Object(Bt.jsx)(Rt.DeviceAccessTime, {}),
											' ',
											Object(Bt.jsx)('span', { children: s.stall.opening_hours }),
										],
									}),
								!0 === j &&
									s.booth_info.length > 0 &&
									Object(Bt.jsxs)(In, {
										children: [
											Object(Bt.jsx)(Rt.ActionInfoOutline, {}),
											' ',
											Object(Bt.jsx)('span', { children: s.booth_info }),
										],
									}),
								!1 === j &&
									Object(Bt.jsxs)(Cn, {
										children: [
											!0 === at(s) && Object(Bt.jsx)(Ln, { children: Object(Bt.jsx)(Rt.ActionAccessible, {}) }),
											null !== s.stall &&
												'' !== s.stall.opening_hours &&
												Object(Bt.jsxs)(Fn, {
													children: [
														Object(Bt.jsx)(Rt.DeviceAccessTime, {}),
														' ',
														Object(Bt.jsx)('span', { children: s.stall.opening_hours }),
													],
												}),
											!0 === l &&
												Object(Bt.jsx)(Nn, {
													children: Object(Bt.jsx)(Pt.e, { label: 'More', primary: !0, onClick: h }),
												}),
										],
									}),
								!0 === j &&
									!0 === d &&
									Object(Bt.jsx)(Cn, {
										children: Object(Bt.jsxs)(Nn, {
											children: [
												Object(Bt.jsx)(Pt.e, { label: 'Copy Link', primary: !0, onClick: p }),
												!0 === l && Object(Bt.jsx)(Pt.e, { label: 'Hide', primary: !0, onClick: h }),
											],
										}),
									}),
							],
						}),
					],
				});
			}
			var Gn,
				Bn = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.pollingPlace,
										n = e.election,
										a = e.showFullCard,
										o = e.showCopyLinkButton,
										c = e.onClickCopyLink;
									return Object(Bt.jsx)(Un, {
										pollingPlace: t,
										election: n,
										showFullCardDefault: void 0 !== a && a,
										showMoreLessButton: !0 !== a,
										showCopyLinkButton: !1 !== o,
										onClickCopyLink: c,
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Wn = Object(c.c)(
					function (e) {
						return {};
					},
					function (e, t) {
						return {
							onClickCopyLink: function () {
								var n, a;
								Nt()(
									((n = t.election),
									(a = t.pollingPlace),
									encodeURI(
										''
											.concat('https://public-legacy.staging.democracysausage.org', '/')
											.concat(D(n), '/polling_places/')
											.concat(a.name, '/')
											.concat(a.premises, '/')
											.concat(a.state, '/')
											.replace(/\s/g, '_'),
									)),
									{ format: 'text/plain' },
								),
									e(Be('Polling place link copied to clipboard.'));
							},
						};
					},
				)(Bn),
				Vn = n(2371),
				Hn = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.errors;
									return void 0 !== e
										? 1 === Object.keys(e).length && 'detail' in e
											? Object(Bt.jsxs)('div', {
													children: [
														Object(Bt.jsx)('h2', {
															children:
																"Sorry about this, but we've found a snag (geddit?) in what you're trying to do:",
														}),
														e.detail,
													],
												})
											: Object(Bt.jsxs)('div', {
													children: [
														Object(Bt.jsx)('h4', {
															children: 'Sorry about this, but we found a few problems with your submission:',
														}),
														Object(Bt.jsx)('ul', {
															children: Object.keys(e).map(function (t) {
																return Object(Bt.jsxs)(
																	'li',
																	{
																		children: [
																			Object(Bt.jsxs)('strong', { children: [Object(Vn.a)(t), ':'] }),
																			' ',
																			!0 === Array.isArray(e[t]) ? e[t].join('; ') : e[t],
																		],
																	},
																	t,
																);
															}),
														}),
													],
												})
										: null;
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				qn = n(102),
				Yn = n.n(qn),
				Kn = n(52),
				Qn = n(572),
				Xn = n.n(Qn),
				Jn = n(2143),
				Zn = wt.a.span(Gn || (Gn = Object(Ct.a)(['\n  color: purple;\n  font-weight: bold !important;\n']))),
				$n = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.searchText,
										n = e.searchResults,
										a = e.onChoosePollingPlace;
									return Object(Bt.jsx)('div', {
										children:
											void 0 !== n &&
											n.length > 0 &&
											Object(Bt.jsx)(Kn.List, {
												children: n.map(function (e, n) {
													var o = e.name === e.premises ? e.name : ''.concat(e.name, ', ').concat(e.premises),
														c = Jn(o, t, function (e, t) {
															return Object(Bt.jsx)(Zn, { children: e }, t);
														}),
														s = Jn(''.concat(e.address, ', ').concat(e.state), t, function (e, t) {
															return Object(Bt.jsx)(Zn, { children: e }, t);
														});
													return Object(Bt.jsx)(
														Kn.ListItem,
														{
															leftAvatar: Object(Bt.jsx)(Yn.a, { icon: Object(Bt.jsx)(Xn.a, {}) }),
															primaryText: c,
															secondaryText: s,
															secondaryTextLines: 2,
															onClick: function (t) {
																a(e);
															},
														},
														e.id,
													);
												}),
											}),
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				ea = n(573),
				ta = n.n(ea),
				na = n(415),
				aa = n.n(na),
				oa = n(344);
			'REACT_APP_GOOGLE_ANALYTICS_UA' in
				Object({
					NODE_ENV: 'production',
					PUBLIC_URL: '',
					WDS_SOCKET_HOST: void 0,
					WDS_SOCKET_PATH: void 0,
					WDS_SOCKET_PORT: void 0,
					FAST_REFRESH: !0,
					REACT_APP_RAVEN_URL: 'https://8d31580cc3314ca0812ff9d72c4d996f@sentry.io/291819',
					REACT_APP_MAPBOX_API_KEY_PROD:
						'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNrZm0xM3Q1MndwYnhnZHBuc2E2In0.Q05Vy754rVLXWJJCD7qX8g',
					REACT_APP_GOOGLE_ANALYTICS_UA: 'UA-48888573-1',
					REACT_APP_ENVIRONMENT: 'PRODUCTION',
					REACT_APP_RAVEN_SITE_NAME: 'DemSausage Public',
					REACT_APP_API_BASE_URL: 'https://public-legacy.staging.democracysausage.org/api',
					REACT_APP_GOOGLE_MAPS_API_KEY: 'AIzaSyBuOuavKmg0pKmdGEPdugThfnKQ7v1sSH0',
					REACT_APP_MAPBOX_API_KEY_DEV:
						'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNldnExZmQxMnpwbWJiODI5Y2R0In0.PtxxMO-qppmcivwcegWKYA',
					REACT_APP_SITE_BASE_URL: 'https://public-legacy.staging.democracysausage.org',
				}) && oa.b('UA-48888573-1');
			var ca = new ((function () {
				function e() {
					var t = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
						n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
					Object(je.a)(this, e),
						(this.verbose = void 0),
						(this.alwaysSend = void 0),
						(this.verbose = t),
						(this.alwaysSend = n);
				}
				return (
					Object(fe.a)(e, [
						{
							key: 'pageview',
							value: function (e) {
								oa.d({ page: e }), oa.c(e), !0 === this.verbose && console.log('GATracker:pageview', e);
							},
						},
						{
							key: 'event',
							value: function (e) {
								oa.a(e), !0 === this.verbose && console.log('GATracker:event', e);
							},
						},
					]),
					e
				);
			})())();
			function sa(e, t, n) {
				navigator.geolocation.getCurrentPosition(
					(function () {
						var a = Object(g.a)(
							x.a.mark(function a(o) {
								var c, s, r;
								return x.a.wrap(function (a) {
									for (;;)
										switch ((a.prev = a.next)) {
											case 0:
												ca.event({
													category: 'Geolocation',
													action: 'onRequestLocationPermissions',
													label: 'Granted geolocation permissions',
												}),
													(c = 'your current location'),
													(s = window),
													(r = s.google),
													new r.maps.Geocoder().geocode(
														{ location: { lat: o.coords.latitude, lng: o.coords.longitude } },
														(function () {
															var a = Object(g.a)(
																x.a.mark(function a(s, r) {
																	var i;
																	return x.a.wrap(function (a) {
																		for (;;)
																			switch ((a.prev = a.next)) {
																				case 0:
																					'OK' === r && s.length > 0
																						? (ca.event({
																								category: 'Geolocation',
																								action: 'geocoder.geocode',
																								label: 'Success for '.concat(window.location.href),
																							}),
																							void 0 !== (i = s[0]) && (c = i.formatted_address),
																							void 0 !== t && t(o, i, c))
																						: (ca.event({
																								category: 'Geolocation',
																								action: 'geocoder.geocode',
																								label: 'Got an error from the geocoder',
																							}),
																							e(Be('Sorry, we encountered an error trying to fetch your location')),
																							void 0 !== n && ((c = 'error fetching location'), n()));
																				case 1:
																				case 'end':
																					return a.stop();
																			}
																	}, a);
																}),
															);
															return function (e, t) {
																return a.apply(this, arguments);
															};
														})(),
													);
											case 5:
											case 'end':
												return a.stop();
										}
								}, a);
							}),
						);
						return function (e) {
							return a.apply(this, arguments);
						};
					})(),
					function (t) {
						var a;
						switch (
							(void 0 !== n && n(),
							ca.event({
								category: 'Geolocation',
								action: 'onRequestLocationPermissions',
								label: 'Got an error when asking for permissions',
								value: t.code,
							}),
							t.code)
						) {
							case 1:
								a = "Sorry, we couldn't use GPS to fetch your location because you've blocked access.";
								break;
							case 2:
								a = "Sorry, we received an error from the GPS sensor on your device and couldn't fetch your location.";
								break;
							case 3:
								a = "Sorry, we didn't receive a location fix from your device in time.";
								break;
							default:
								a = "Sorry, we couldn't use GPS to fetch your location for an unknown reason.";
						}
						e(Be(a));
					},
					{ maximumAge: 3e5, timeout: 1e4 },
				);
			}
			var ra,
				ia,
				la,
				da,
				pa,
				ua,
				ma,
				ja,
				fa,
				ha,
				ba,
				Oa,
				xa,
				ga,
				ya,
				va,
				za,
				Ca,
				wa,
				_a = n(2373),
				Sa = n(416),
				Ea = n.n(Sa),
				ka = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						Object(je.a)(this, n),
							((a = t.call(this, e)).geocoder = void 0),
							(a.service = void 0),
							(a.getPlacePredictions = void 0),
							(a.state = { data: [], searchText: void 0 !== e.searchText ? e.searchText : '' });
						var o = window.google;
						a.geocoder = new o.maps.Geocoder();
						var c = new o.maps.LatLng(-44.2422476272383, 112.568664550781),
							s = new o.maps.LatLng(-10.1135419412474, 154.092864990234),
							r = new o.maps.LatLngBounds(c, s);
						return (
							(a.service = new o.maps.places.AutocompleteService(null)),
							(a.updateInput = a.updateInput.bind(Object(Ot.a)(a))),
							(a.populateData = a.populateData.bind(Object(Ot.a)(a))),
							(a.getCurrentDataState = a.getCurrentDataState.bind(Object(Ot.a)(a))),
							(a.getLatLgn = a.getLatLgn.bind(Object(Ot.a)(a))),
							(a.getPlacePredictions = Object(_a.a)(function () {
								if (this.state.searchText.length >= 3) {
									var e = this;
									this.service.getPlacePredictions(
										{ input: this.state.searchText, region: 'au', bounds: r, types: this.props.types },
										function (t) {
											t && e.populateData(t);
										},
									);
								} else this.populateData([]);
							}, 1500)),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'componentDidUpdate',
								value: function (e, t) {
									void 0 !== this.props.searchText &&
										this.props.searchText !== e.searchText &&
										this.setState({ searchText: this.props.searchText });
								},
							},
							{
								key: 'getCurrentDataState',
								value: function () {
									return this.state.data;
								},
							},
							{
								key: 'getLatLgn',
								value: function (e, t) {
									this.geocoder.geocode({ placeId: e }, function (e, n) {
										t(e, n);
									});
								},
							},
							{
								key: 'getPoweredByGoogleMenuItem',
								value: function () {
									return {
										text: '',
										value: Object(Bt.jsx)(Pt.j, {
											style: { cursor: 'default' },
											children: Object(Bt.jsx)('div', {
												style: { paddingTop: 20 },
												children: Object(Bt.jsx)('img', {
													style: { float: 'right' },
													width: 96,
													height: 12,
													src: 'https://developers.google.com/places/documentation/images/powered-by-google-on-white.png',
													alt: 'presentation',
												}),
											}),
										}),
									};
								},
							},
							{
								key: 'updateInput',
								value: function (e) {
									'' === e && void 0 !== this.props.onCancelSearch && this.props.onCancelSearch(),
										this.setState({ searchText: e }, this.getPlacePredictions);
								},
							},
							{
								key: 'populateData',
								value: function (e) {
									this.props.onReceiveSearchResults(e), this.setState({ data: e });
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t =
											(e.componentRestrictions,
											e.onReceiveSearchResults,
											e.onCancelSearch,
											Object(Tt.a)(e, ['componentRestrictions', 'onReceiveSearchResults', 'onCancelSearch']));
									return Object(Bt.jsx)(
										Ea.a,
										Object(v.a)(
											Object(v.a)({ name: 'search' }, t),
											{},
											{
												searchText: this.state.searchText,
												onChange: this.updateInput,
												onKeyDown: function (e) {
													'Enter' === e.key && e.preventDefault();
												},
											},
										),
									);
								},
							},
						]),
						n
					);
				})(yt.Component),
				Ta = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).onRequestLocationPermissions = void 0),
							(a.state = {
								waitingForGeolocation: !1,
								addressSearchResults: [],
								searchText: void 0 !== e.searchText ? e.searchText : '',
							}),
							(a.onRequestLocationPermissions = e.onRequestLocationPermissions.bind(Object(Ot.a)(a))),
							(a.onWaitForGeolocation = a.onWaitForGeolocation.bind(Object(Ot.a)(a))),
							(a.onGeolocationComplete = a.onGeolocationComplete.bind(Object(Ot.a)(a))),
							(a.onGeolocationError = a.onGeolocationError.bind(Object(Ot.a)(a))),
							(a.onReceiveAddressSearchResults = a.onReceiveAddressSearchResults.bind(Object(Ot.a)(a))),
							(a.onPlaceChosen = a.onPlaceChosen.bind(Object(Ot.a)(a))),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'componentDidMount',
								value: function () {
									var e = this,
										t = this.props,
										n = t.initMode,
										a = t.initModeOverride;
									if ((void 0 !== a ? a : n) === V.GEOLOCATION)
										var o = window.setInterval(function () {
											void 0 !== window.google && (window.clearInterval(o), e.onRequestLocationPermissions());
										}, 250);
								},
							},
							{
								key: 'onWaitForGeolocation',
								value: function () {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { waitingForGeolocation: !0 }));
								},
							},
							{
								key: 'onGeolocationComplete',
								value: function (e, t, n) {
									var a = this.props.onChoosePlace;
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { waitingForGeolocation: !1 })),
										this.onPlaceChosen(t),
										a(t);
								},
							},
							{
								key: 'onGeolocationError',
								value: function () {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { waitingForGeolocation: !1 }));
								},
							},
							{
								key: 'onReceiveAddressSearchResults',
								value: function (e) {
									ca.event({
										category: 'GooglePlacesAutocompleteList',
										action: 'onReceiveAddressSearchResults',
										label: 'Number of address search results from the geocoder',
										value: e.length,
									}),
										this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { addressSearchResults: e })),
										void 0 !== this.props.onShowPlaceAutocompleteResults && this.props.onShowPlaceAutocompleteResults();
								},
							},
							{
								key: 'onPlaceChosen',
								value: function (e) {
									this.setState(
										Object(v.a)(
											Object(v.a)({}, this.state),
											{},
											{ addressSearchResults: [], searchText: e.formatted_address },
										),
									);
								},
							},
							{
								key: 'getAutoFocus',
								value: function () {
									return (
										!0 === this.props.autoFocus ||
										(this.props.initMode === V.FOCUS_INPUT &&
											(void 0 === this.props.initModeOverride || this.props.initModeOverride === V.FOCUS_INPUT))
									);
								},
							},
							{
								key: 'getHintText',
								value: function () {
									var e = this.props.hintText,
										t = this.state.waitingForGeolocation;
									return !0 === this.canUseGPS()
										? !1 === t
											? ''.concat(e, ' or use GPS \u2192')
											: 'Fetching your location...'
										: e;
								},
							},
							{
								key: 'getSearchIcon',
								value: function () {
									var e = this.state.waitingForGeolocation;
									return !0 === this.canUseGPS()
										? !1 === e
											? Object(Bt.jsx)(Rt.DeviceLocationSearching, {})
											: Object(Bt.jsx)(Rt.DeviceLocationSearching, { className: 'spin' })
										: Object(Bt.jsx)(Rt.ActionSearch, {});
								},
							},
							{
								key: 'canUseGPS',
								value: function () {
									return (!0 === this.props.gps || void 0 === this.props.gps) && this.props.geolocationSupported;
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props,
										n = t.onChoosePlace,
										a = t.onCancelSearch,
										o = t.fetchLocationFromGeocoder,
										c = t.componentRestrictions,
										s = t.style,
										r = this.state,
										i = r.addressSearchResults,
										l = r.searchText;
									return Object(Bt.jsxs)('div', {
										children: [
											Object(Bt.jsx)(aa.a, {
												params: { key: 'AIzaSyBuOuavKmg0pKmdGEPdugThfnKQ7v1sSH0', libraries: 'places' },
												render: function (t) {
													return (
														t &&
														Object(Bt.jsx)(ka, {
															onReceiveSearchResults: e.onReceiveAddressSearchResults,
															componentRestrictions: c,
															hintText: e.getHintText(),
															autoFocus: e.getAutoFocus(),
															searchIcon: e.getSearchIcon(),
															closeIcon: Object(Bt.jsx)(Rt.NavigationClose, {}),
															onRequestSearch: !0 === e.canUseGPS() ? e.onRequestLocationPermissions : function () {},
															onCancelSearch: a,
															searchText: l,
															value: l,
															style: s,
														})
													);
												},
											}),
											i.length > 0 &&
												Object(Bt.jsx)(Kn.List, {
													children: i.map(function (t, a) {
														return Object(Bt.jsx)(
															Kn.ListItem,
															{
																leftAvatar: Object(Bt.jsx)(Yn.a, { icon: Object(Bt.jsx)(ta.a, {}) }),
																primaryText: t.structured_formatting.main_text,
																secondaryText: t.structured_formatting.secondary_text,
																secondaryTextLines: 2,
																onClick: function (a) {
																	o(n, t, e.onPlaceChosen);
																},
															},
															t.place_id,
														);
													}),
												}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Pa = Object(c.c)(
					function (e, t) {
						var n = e.app;
						return { initMode: n.pollingPlaceFinderMode, geolocationSupported: n.geolocationSupported };
					},
					function (e) {
						return {
							onRequestLocationPermissions: function () {
								!0 === this.canUseGPS() &&
									(ca.event({
										category: 'GooglePlacesAutocompleteList',
										action: 'onRequestLocationPermissions',
										label: 'Clicked the geolocation button',
									}),
									this.onWaitForGeolocation(),
									sa(e, this.onGeolocationComplete, this.onGeolocationError));
							},
							fetchLocationFromGeocoder: function (e, t, n) {
								ca.event({
									category: 'GooglePlacesAutocompleteList',
									action: 'fetchLocationFromGeocoder',
									label: 'Chose an address',
								}),
									new window.google.maps.Geocoder().geocode({ placeId: t.place_id }, function (a, o) {
										'OK' === o && a.length > 0
											? (ca.event({
													category: 'GooglePlacesAutocompleteList',
													action: 'fetchLocationFromGeocoder',
													label: 'Number of geocoder results',
													value: a.length,
												}),
												n(a[0]),
												e(a[0], t))
											: ca.event({
													category: 'GooglePlacesAutocompleteList',
													action: 'fetchLocationFromGeocoder',
													label: 'Got an error from the geocoder',
												});
									});
							},
						};
					},
				)(Ta),
				Ma = wt.a.h5(
					ra || (ra = Object(Ct.a)(['\n  margin-bottom: 0px;\n  color: ', ';\n  font-weight: normal;\n'])),
					Ie.grey600,
				),
				Ra = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).state = { geocodedPlace: null }),
							(a.onChoosePlace = a.onChoosePlace.bind(Object(Ot.a)(a))),
							(a.onCancelChosenLocation = a.onCancelChosenLocation.bind(Object(Ot.a)(a))),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'onChoosePlace',
								value: (function () {
									var e = Object(g.a)(
										x.a.mark(function e(t) {
											var n;
											return x.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	(n = this.props.fetchPollingPlaces),
																	(e.t0 = this),
																	(e.t1 = v.a),
																	(e.t2 = Object(v.a)({}, this.state)),
																	(e.t3 = {}),
																	(e.t4 = t),
																	(e.next = 8),
																	n(t.geometry.location.lat(), t.geometry.location.lng())
																);
															case 8:
																(e.t5 = e.sent),
																	(e.t6 = { geocodedPlace: e.t4, matchedPollingPlaces: e.t5 }),
																	(e.t7 = (0, e.t1)(e.t2, e.t3, e.t6)),
																	e.t0.setState.call(e.t0, e.t7);
															case 12:
															case 'end':
																return e.stop();
														}
												},
												e,
												this,
											);
										}),
									);
									return function (t) {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'onCancelChosenLocation',
								value: function () {
									this.setState(
										Object(v.a)(Object(v.a)({}, this.state), {}, { geocodedPlace: null, matchedPollingPlaces: void 0 }),
									);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.onConfirmChosenLocation,
										a = e.componentRestrictions,
										o = e.autoFocus,
										c = e.hintText,
										s = this.state,
										r = s.geocodedPlace,
										i = s.matchedPollingPlaces;
									return Object(Bt.jsxs)('div', {
										children: [
											!0 === t.polling_places_loaded &&
												Object(Bt.jsxs)('div', {
													children: [
														Object(Bt.jsx)(Pa, {
															componentRestrictions: a,
															autoFocus: o,
															hintText: c,
															onShowPlaceAutocompleteResults: this.onCancelChosenLocation,
															onChoosePlace: this.onChoosePlace,
															onCancelSearch: this.onCancelChosenLocation,
														}),
														Object(Bt.jsx)('br', {}),
													],
												}),
											null !== r &&
												void 0 !== i &&
												i.length > 0 &&
												Object(Bt.jsxs)(yt.Fragment, {
													children: [
														Object(Bt.jsx)(Kn.ListItem, {
															leftAvatar: Object(Bt.jsx)(Yn.a, {
																icon: Object(Bt.jsx)(Rt.ActionInfo, {}),
																backgroundColor: Ie.blue500,
															}),
															primaryText: 'Choose a polling booth from below to continue',
															disabled: !0,
														}),
														Object(Bt.jsxs)(Ma, {
															children: [
																'Polling booths close to ',
																Object(Bt.jsx)('em', { children: r.formatted_address }),
															],
														}),
													],
												}),
											null !== r &&
												void 0 !== i &&
												0 === i.length &&
												Object(Bt.jsx)(Kn.ListItem, {
													leftAvatar: Object(Bt.jsx)(Yn.a, {
														icon: Object(Bt.jsx)(Rt.ActionInfo, {}),
														backgroundColor: Ie.blue500,
													}),
													primaryText: "Oh dear. We couldn't find any polling booths near there.",
													secondaryText:
														"Drop us an email with the place you were searching for and we'll help you out.",
													secondaryTextLines: 2,
													disabled: !0,
												}),
											void 0 !== i && i.length > 0 && Object(Bt.jsx)($n, { searchResults: i, onChoosePollingPlace: n }),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				Aa = Object(c.c)(
					function (e, t) {
						return {};
					},
					function (e, t) {
						return {
							fetchPollingPlaces: function (n, a) {
								return Object(g.a)(
									x.a.mark(function o() {
										var c;
										return x.a.wrap(function (o) {
											for (;;)
												switch ((o.prev = o.next)) {
													case 0:
														return (o.next = 2), e(Ke(t.election, n, a));
													case 2:
														return (c = o.sent), o.abrupt('return', c.slice(0, 5));
													case 4:
													case 'end':
														return o.stop();
												}
										}, o);
									}),
								)();
							},
						};
					},
				)(Ra),
				Ia = n(163),
				La = n(154),
				Fa = n.n(La),
				Na = n(89),
				Da = n.n(Na),
				Ua = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return Object(je.a)(this, n), ((a = t.call(this, e)).onConfirm = a.onConfirm.bind(Object(Ot.a)(a))), a;
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'onConfirm',
								value: function () {
									this.props.onConfirm(this.props.stallLocationInfo);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.stallLocationInfo,
										n = e.showActions,
										a = e.onCancel;
									return Object(Bt.jsxs)(Da.a, {
										children: [
											Object(Bt.jsx)(Ia.Card, {
												children: Object(Bt.jsx)(Ia.CardHeader, {
													title: t.name,
													subtitle: t.address,
													avatar: Object(Bt.jsx)(Yn.a, { icon: Object(Bt.jsx)(Rt.ActionHome, {}) }),
													textStyle: { width: '80%', paddingRight: '0px' },
												}),
											}),
											n &&
												Object(Bt.jsxs)(Ia.Card, {
													children: [
														Object(Bt.jsx)(Ia.CardHeader, {
															title: 'Is this where your stall is?',
															titleStyle: { paddingTop: 12 },
															avatar: Object(Bt.jsx)(Yn.a, { icon: Object(Bt.jsx)(Rt.ActionQuestionAnswer, {}) }),
															textStyle: { width: '80%', paddingRight: '0px' },
														}),
														Object(Bt.jsxs)(Ia.CardActions, {
															children: [
																Object(Bt.jsx)(Fa.a, { label: 'No', onClick: a, primary: !0 }),
																Object(Bt.jsx)(Fa.a, { label: 'Yes', onClick: this.onConfirm, primary: !0 }),
															],
														}),
													],
												}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Ga = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).state = {
								addressResult: null,
								geocodedPlace: null,
								stallLocationInfo: null,
								locationConfirmed: !1,
							}),
							(a.onChoosePlace = a.onChoosePlace.bind(Object(Ot.a)(a))),
							(a.onCancelChosenLocation = a.onCancelChosenLocation.bind(Object(Ot.a)(a))),
							(a.onConfirmChosenLocation = a.onConfirmChosenLocation.bind(Object(Ot.a)(a))),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'onChoosePlace',
								value: function (e, t) {
									this.setState(
										Object(v.a)(
											Object(v.a)({}, this.state),
											{},
											{ addressResult: t, geocodedPlace: e, stallLocationInfo: this.getPollingPlaceInfo(e, t) },
										),
									);
								},
							},
							{
								key: 'onCancelChosenLocation',
								value: function () {
									this.setState(
										Object(v.a)(
											Object(v.a)({}, this.state),
											{},
											{ addressResult: null, geocodedPlace: null, stallLocationInfo: null, locationConfirmed: !1 },
										),
									);
								},
							},
							{
								key: 'onConfirmChosenLocation',
								value: function (e) {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { locationConfirmed: !0 })),
										this.props.onConfirmChosenLocation(this.state.stallLocationInfo);
								},
							},
							{
								key: 'getPollingPlaceInfo',
								value: function (e, t) {
									var n = e.address_components.find(function (e) {
										return e.types.includes('administrative_area_level_1') && e.types.includes('political');
									});
									return {
										geom: { type: 'Point', coordinates: [e.geometry.location.lng(), e.geometry.location.lat()] },
										name: t.structured_formatting.main_text,
										address: e.formatted_address,
										state: void 0 !== n ? n.short_name : null,
									};
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.componentRestrictions,
										a = e.autoFocus,
										o = e.hintText,
										c = this.state,
										s = c.stallLocationInfo,
										r = c.locationConfirmed;
									return Object(Bt.jsxs)('div', {
										children: [
											!1 === r &&
												!1 === t.polling_places_loaded &&
												Object(Bt.jsxs)('div', {
													children: [
														Object(Bt.jsx)(Pa, {
															componentRestrictions: n,
															autoFocus: a,
															hintText: o,
															onChoosePlace: this.onChoosePlace,
															gps: !1,
														}),
														Object(Bt.jsx)('br', {}),
													],
												}),
											null !== s &&
												Object(Bt.jsx)(Ua, {
													stallLocationInfo: s,
													showActions: !1 === r,
													onCancel: this.onCancelChosenLocation,
													onConfirm: this.onConfirmChosenLocation,
												}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				Ba = Object(c.c)(
					function (e, t) {
						return {};
					},
					function (e) {
						return {};
					},
				)(Ga),
				Wa = function (e) {
					return e ? void 0 : 'Required';
				},
				Va = function (e) {
					return e && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(e) ? 'Invalid email address' : void 0;
				},
				Ha = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.hintText,
										n = e.name,
										a = Object(Tt.a)(e, ['hintText', 'name']);
									return Object(Bt.jsxs)('div', {
										children: [
											Object(Bt.jsx)(At.a, Object(v.a)({ name: n }, a)),
											Object(Bt.jsx)('div', { style: { color: Ie.grey500, fontSize: 12 }, children: t }),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				qa = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.name,
										n = Object(Tt.a)(e, ['name']);
									return Object(Bt.jsx)(
										At.a,
										Object(v.a)({ name: t, component: Lt.Toggle, thumbStyle: { backgroundColor: Ie.grey100 } }, n),
									);
								},
							},
						]),
						n
					);
				})(yt.Component),
				Ya = Object(wt.a)(Mt.StepContent)(
					ia ||
						(ia = Object(Ct.a)([
							"\n  /* Give the contents of StepContent some breathing room so components\n    using <Paper /> don't look cut off */\n  & > div > div > div > div > div {\n    padding: 5px;\n  }\n",
						])),
				),
				Ka = wt.a.div(la || (la = Object(Ct.a)(['\n  margin-top: 35px;\n  margin-bottom: 35px;\n']))),
				Qa = wt.a.h2(da || (da = Object(Ct.a)(['\n  margin-bottom: 0px;\n']))),
				Xa = wt.a.div(pa || (pa = Object(Ct.a)(['\n  margin-top: 30px;\n']))),
				Ja = wt.a.h4(ua || (ua = Object(Ct.a)(['\n  margin-top: 20px;\n  margin-bottom: 10px;\n']))),
				Za = wt.a.div(
					ma ||
						(ma = Object(Ct.a)([
							'\n  margin-bottom: 25px;\n  font-size: 14px;\n  line-height: 24px;\n  color: ',
							';\n  width: 75%;\n',
						])),
					Ie.grey800,
				),
				$a = wt.a.button(ja || (ja = Object(Ct.a)(['\n  display: none;\n']))),
				eo = wt.a.div(fa || (fa = Object(Ct.a)(['\n  margin-bottom: 60px;\n']))),
				to = wt.a.div(ha || (ha = Object(Ct.a)(['\n  margin-top: 0;\n  margin-bottom: 10;\n  max-width: 650;\n']))),
				no = wt.a.h2(ba || (ba = Object(Ct.a)(['\n  margin-top: 0px;\n  margin-bottom: 15px;\n']))),
				ao = Object(wt.a)(Pt.i)(
					Oa ||
						(Oa = Object(Ct.a)([
							'\n  & div:last-child {\n    height: auto !important;\n    white-space: normal !important;\n    -webkit-line-clamp: unset !important;\n    line-clamp: unset !important;\n    overflow: auto !important;\n  }\n',
						])),
				),
				oo = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e,
										t = this.props,
										n = t.liveElections,
										a = t.stepIndex,
										o = t.onChooseElection,
										c = t.chosenElection,
										s = t.onConfirmChosenLocation,
										r = t.stallLocationInfo,
										i = t.locationConfirmed,
										l = t.formIsSubmitting,
										d = t.formSyncErrors,
										p = t.formHasSubmitFailed,
										u = t.errors,
										m = this.props,
										j = m.onSaveForm,
										f = m.handleSubmit,
										h = m.onSubmit,
										b =
											null !== (null === r || void 0 === r ? void 0 : r.stall) &&
											void 0 !== (null === r || void 0 === r ? void 0 : r.stall);
									return (
										null !== r &&
											(e =
												'id' in r
													? r.name === r.premises
														? r.name
														: ''.concat(r.name, ', ').concat(r.premises)
													: ''.concat(r.name, ', ').concat(r.address)),
										Object(Bt.jsxs)(Mt.Stepper, {
											activeStep: a,
											orientation: 'vertical',
											children: [
												Object(Bt.jsxs)(Mt.Step, {
													children: [
														Object(Bt.jsx)(Mt.StepLabel, { children: null === c ? 'Choose an election' : c.name }),
														Object(Bt.jsx)(Ya, {
															children: Object(Bt.jsx)(Lt.RadioButtonGroup, {
																name: 'elections',
																onChange: o,
																children: n.map(function (e) {
																	return Object(Bt.jsx)(
																		Pt.l,
																		{ value: e.id, label: e.name, style: { marginBottom: 16 } },
																		e.id,
																	);
																}),
															}),
														}),
													],
												}),
												Object(Bt.jsxs)(Mt.Step, {
													children: [
														Object(Bt.jsx)(Mt.StepLabel, { children: !1 === i ? 'Where is your stall?' : e }),
														Object(Bt.jsxs)(Ya, {
															children: [
																null !== c &&
																	!1 === c.polling_places_loaded &&
																	Object(Bt.jsx)(Ba, {
																		election: c,
																		onConfirmChosenLocation: s,
																		componentRestrictions: { country: 'AU' },
																		autoFocus: !1,
																		hintText: 'Type an address',
																	}),
																null !== c &&
																	!0 === c.polling_places_loaded &&
																	Object(Bt.jsx)(Aa, {
																		election: c,
																		onConfirmChosenLocation: s,
																		componentRestrictions: { country: 'AU' },
																		autoFocus: !1,
																		hintText: 'Type an address',
																	}),
															],
														}),
													],
												}),
												Object(Bt.jsxs)(Mt.Step, {
													children: [
														Object(Bt.jsx)(Mt.StepLabel, { children: 'Tell us about your stall' }),
														Object(Bt.jsxs)(Ya, {
															children: [
																!0 === b &&
																	Object(Bt.jsxs)(to, {
																		children: [
																			Object(Bt.jsx)(no, {
																				children: "We've already had a submission for this polling booth",
																			}),
																			Object(Bt.jsx)(Wn, {
																				pollingPlace: r,
																				election: c,
																				showFullCard: !0,
																				showCopyLinkButton: !1,
																			}),
																			Object(Bt.jsxs)(Pt.h, {
																				children: [
																					Object(Bt.jsx)(ao, {
																						primaryText: 'Would you like to edit it?',
																						secondaryText:
																							"If this was you and you'd like to make a change, check your inbox for the confirmation email we sent you. There's a link in there that will let you edit your stall.",
																						secondaryTextLines: 2,
																						leftAvatar: Object(Bt.jsx)(Pt.b, {
																							icon: Object(Bt.jsx)(Rt.EditorModeEdit, {}),
																						}),
																					}),
																					Object(Bt.jsx)(ao, {
																						primaryText: 'Have another stall to add?',
																						secondaryText:
																							"If this wasn't you, or if you're running another stall at this booth, please review what's already here and consider if you need to list your stall in addition to the existing one. If you still want to add content, you can do so below.",
																						secondaryTextLines: 2,
																						leftAvatar: Object(Bt.jsx)(Pt.b, {
																							icon: Object(Bt.jsx)(Rt.AvFiberNew, {}),
																						}),
																					}),
																				],
																			}),
																		],
																	}),
																Object(Bt.jsx)('form', {
																	onSubmit: f(h),
																	children: Object(Bt.jsxs)('div', {
																		children: [
																			Object(Bt.jsxs)(Ka, {
																				style: { marginTop: 0 },
																				children: [
																					Object(Bt.jsx)(Ha, {
																						name: 'name',
																						component: Lt.TextField,
																						floatingLabelText: 'Give your stall a name!',
																						hintText: 'e.g. Smith Hill Primary School Sausage Sizzle',
																						fullWidth: !0,
																						validate: [Wa],
																						autoComplete: 'no',
																					}),
																					Object(Bt.jsx)(Ha, {
																						name: 'description',
																						component: Lt.TextField,
																						multiLine: !0,
																						floatingLabelText: 'Describe your stall',
																						hintText:
																							"Who's running it and why you're running it e.g. The P&C is running the stall to raise funds for the Year 7 school camp",
																						fullWidth: !0,
																						validate: [Wa],
																						autoComplete: 'no',
																					}),
																					Object(Bt.jsx)(Ha, {
																						name: 'opening_hours',
																						component: Lt.TextField,
																						floatingLabelText: 'Stall opening hours (optional)',
																						hintText: 'e.g. 8AM - 2PM',
																						fullWidth: !0,
																						autoComplete: 'no',
																					}),
																					Object(Bt.jsx)(Ha, {
																						name: 'website',
																						component: Lt.TextField,
																						floatingLabelText: 'Stall website or social media page (optional)',
																						hintText:
																							"We'll include a link to your site as part of your stall's information",
																						fullWidth: !0,
																						autoComplete: 'no',
																					}),
																				],
																			}),
																			Object(Bt.jsxs)(Ka, {
																				children: [
																					Object(Bt.jsx)(Qa, { children: "What's on offer?" }),
																					Object(Bt.jsxs)(Pt.h, {
																						children: [
																							Object(Bt.jsx)(Pt.i, {
																								primaryText: 'Is there a sausage sizzle?',
																								leftIcon: Object(Bt.jsx)(en, {}),
																								rightToggle: Object(Bt.jsx)(qa, { name: 'bbq' }),
																							}),
																							Object(Bt.jsx)(Pt.i, {
																								primaryText: 'Is there a cake stall?',
																								leftIcon: Object(Bt.jsx)(qt, {}),
																								rightToggle: Object(Bt.jsx)(qa, { name: 'cake' }),
																							}),
																							Object(Bt.jsx)(Pt.i, {
																								primaryText: 'Are there savoury vegetarian options?',
																								leftIcon: Object(Bt.jsx)(yn, {}),
																								rightToggle: Object(Bt.jsx)(qa, { name: 'vego' }),
																							}),
																							Object(Bt.jsx)(Pt.i, {
																								primaryText: "Is there any food that's halal?",
																								leftIcon: Object(Bt.jsx)(Xt, {}),
																								rightToggle: Object(Bt.jsx)(qa, { name: 'halal' }),
																							}),
																							Object(Bt.jsx)(Pt.i, {
																								primaryText: 'Do you have coffee?',
																								leftIcon: Object(Bt.jsx)(Kt, {}),
																								rightToggle: Object(Bt.jsx)(qa, { name: 'coffee' }),
																							}),
																							Object(Bt.jsx)(Pt.i, {
																								primaryText: 'Are there bacon and eggs?',
																								leftIcon: Object(Bt.jsx)(Vt, {}),
																								rightToggle: Object(Bt.jsx)(qa, { name: 'bacon_and_eggs' }),
																							}),
																						],
																					}),
																					Object(Bt.jsx)(Ha, {
																						name: 'free_text',
																						component: Lt.TextField,
																						floatingLabelText: 'Anything else?',
																						hintText:
																							'e.g. We also have yummy gluten free sausage rolls, cold drinks, and pony rides!',
																						fullWidth: !0,
																						autoComplete: 'no',
																					}),
																				],
																			}),
																			Object(Bt.jsxs)(Ka, {
																				children: [
																					Object(Bt.jsx)(Qa, { children: 'Your details' }),
																					Object(Bt.jsx)(Ha, {
																						name: 'email',
																						component: Lt.TextField,
																						floatingLabelText: "What's your email address?",
																						hintText: "So we can let you know when we've approved your stall",
																						fullWidth: !0,
																						validate: [Wa, Va],
																						type: 'email',
																						autoComplete: 'email',
																					}),
																				],
																			}),
																			Object(Bt.jsx)(Hn, { errors: u }),
																			!0 === p && Object.keys(d).length > 0 && Object(Bt.jsx)(Hn, { errors: d }),
																			Object(Bt.jsx)(Pt.m, {
																				label: 'Submit Stall',
																				disabled: l,
																				primary: !0,
																				onClick: j,
																			}),
																			Object(Bt.jsx)($a, { type: 'submit' }),
																			Object(Bt.jsxs)(Xa, {
																				children: [
																					Object(Bt.jsxs)(Ja, {
																						children: [
																							Object(Bt.jsx)(Rt.HardwareSecurity, {}),
																							' A word about privacy',
																						],
																					}),
																					Object(Bt.jsxs)(Za, {
																						children: [
																							"Democracy Sausage loves open data, but we also love privacy and not sharing your data with anyone who shouldn't have it. Without access to open (i.e. publicly available, reusable, and free) polling place data from the electoral commissions Democracy Sausage wouldn't exist, so where we can we like to share the data we crowdsauce as open data for others to use.",
																							Object(Bt.jsx)('br', {}),
																							Object(Bt.jsx)('br', {}),
																							'For some elections we\'ll allow third parties to display information submitted to Democracy Sausage on their websites - e.g. local media outlets who want to show a map of sausage sizzles, other election sausage sizzle mapping sites, or companies and political parties running "Where to vote" websites who want to show people where to find sausage sizzles. Democracy Sausage is 100% volunteer-run because we love the idea of mapping sausage sizzles - we ',
																							Object(Bt.jsx)('strong', { children: 'never' }),
																							' ',
																							'benefit financially or personally from these arrangements.',
																							Object(Bt.jsx)('br', {}),
																							Object(Bt.jsx)('br', {}),
																							"We'll allow these third parties to use information about your stall (",
																							Object(Bt.jsx)('strong', {
																								children: 'its name, a description of it, and any website address',
																							}),
																							') and what you have on offer (',
																							Object(Bt.jsx)('strong', {
																								children: "whether there's a sausage sizzle, cake stall, et cetera",
																							}),
																							'). We ',
																							Object(Bt.jsx)('strong', { children: "won't" }),
																							' tell these third parties anything about you (the person who is submitting this stall), this includes',
																							' ',
																							Object(Bt.jsx)('strong', {
																								children:
																									'your email, IP address, and any other personally identifiable information that your phone or laptop transmits to us',
																							}),
																							'. All of the information about where your stall actually is comes from the electoral commissions and is already publicly available.',
																							Object(Bt.jsx)('br', {}),
																							Object(Bt.jsx)('br', {}),
																							'Got questions or concerns about any of this? Just get in touch with us at',
																							' ',
																							Object(Bt.jsx)('a', {
																								href: 'mailto:ausdemocracysausage@gmail.com',
																								children: 'ausdemocracysausage@gmail.com',
																							}),
																							" - we're very happy to discuss.",
																						],
																					}),
																				],
																			}),
																			Object(Bt.jsx)(eo, {}),
																		],
																	}),
																}),
															],
														}),
													],
												}),
											],
										})
									);
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				co = Object(It.a)({ form: 'addStall', enableReinitialize: !0, onChange: function (e, t, n) {} })(oo),
				so = function (e) {
					return {
						name: e.name,
						description: e.description,
						opening_hours: e.opening_hours,
						website: e.website,
						email: e.email,
						noms: (function () {
							var t = {};
							return (
								['bbq', 'cake', 'vego', 'halal', 'coffee', 'bacon_and_eggs', 'free_text'].forEach(function (n) {
									'free_text' !== n ? !0 === e[n] && (t[n] = !0) : void 0 !== e[n] && (t[n] = e[n]);
								}),
								t
							);
						})(),
					};
				},
				ro = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).initialValues = void 0),
							(a.state = {
								stepIndex: 1 === e.liveElections.length ? 1 : 0,
								chosenElection: 1 === e.liveElections.length ? e.liveElections[0] : null,
								stallLocationInfo: null,
								locationConfirmed: !1,
								errors: void 0,
							}),
							(a.onChooseElection = a.onChooseElection.bind(Object(Ot.a)(a))),
							(a.onConfirmChosenLocation = a.onConfirmChosenLocation.bind(Object(Ot.a)(a))),
							(a.initialValues = {}),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'UNSAFE_componentWillMount',
								value: function () {
									this.initialValues = {};
								},
							},
							{
								key: 'onConfirmChosenLocation',
								value: function (e) {
									this.setState(
										Object(v.a)(
											Object(v.a)({}, this.state),
											{},
											{ stepIndex: 2, stallLocationInfo: e, locationConfirmed: !0 },
										),
									);
								},
							},
							{
								key: 'onChooseElection',
								value: function (e, t) {
									var n = this.props.liveElections.find(function (e) {
										return String(e.id) === String(t);
									});
									this.setState(
										Object(v.a)(
											Object(v.a)({}, this.state),
											{},
											{ stepIndex: 1, chosenElection: n, stallLocationInfo: null, locationConfirmed: !1 },
										),
									);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props,
										n = t.liveElections,
										a = t.formIsSubmitting,
										o = t.formSyncErrors,
										c = t.formHasSubmitFailed,
										s = t.onFormSubmit,
										r = t.onSaveForm,
										i = t.onStallAdded,
										l = this.state,
										d = l.stepIndex,
										p = l.chosenElection,
										u = l.stallLocationInfo,
										m = l.locationConfirmed,
										j = l.errors;
									return Object(Bt.jsx)(co, {
										liveElections: n,
										stepIndex: d,
										onChooseElection: this.onChooseElection,
										chosenElection: p,
										onConfirmChosenLocation: this.onConfirmChosenLocation,
										stallLocationInfo: u,
										locationConfirmed: m,
										initialValues: this.initialValues,
										formIsSubmitting: a,
										formSyncErrors: o,
										formHasSubmitFailed: c,
										errors: j,
										onSubmit: (function () {
											var t = Object(g.a)(
												x.a.mark(function t(n, a, o) {
													return x.a.wrap(function (t) {
														for (;;)
															switch ((t.prev = t.next)) {
																case 0:
																	return (t.next = 2), s(i, n, p, u, e);
																case 2:
																case 'end':
																	return t.stop();
															}
													}, t);
												}),
											);
											return function (e, n, a) {
												return t.apply(this, arguments);
											};
										})(),
										onSaveForm: function () {
											r();
										},
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				io = Object(c.c)(
					function (e, t) {
						return {
							liveElections: A(e),
							formIsSubmitting: Object(_t.a)('addStall')(e),
							formSyncErrors: Object(St.a)('addStall')(e),
							formHasSubmitFailed: Object(Et.a)('addStall')(e),
						};
					},
					function (e) {
						return {
							onFormSubmit: function (t, n, a, o, c) {
								return Object(g.a)(
									x.a.mark(function s() {
										var r, i, l, d;
										return x.a.wrap(function (s) {
											for (;;)
												switch ((s.prev = s.next)) {
													case 0:
														if (null !== o) {
															s.next = 2;
															break;
														}
														return s.abrupt('return');
													case 2:
														return (
															((r = so(n)).election = a.id),
															!1 === a.polling_places_loaded ? (r.location_info = o) : (r.polling_place = o.id),
															(s.next = 7),
															e(lt(r))
														);
													case 7:
														(i = s.sent),
															(l = i.response),
															(d = i.json),
															201 === l.status
																? t()
																: 400 === l.status &&
																	c.setState(Object(v.a)(Object(v.a)({}, c.state), {}, { errors: d }));
													case 11:
													case 'end':
														return s.stop();
												}
										}, s);
									}),
								)();
							},
							onSaveForm: function () {
								e(Object(kt.a)('addStall'));
							},
						};
					},
				)(ro),
				lo = wt.a.div(xa || (xa = Object(Ct.a)(['']))),
				po = wt.a.div(
					ga ||
						(ga = Object(Ct.a)([
							'\n  padding-left: 15px;\n  padding-right: 15px;\n  margin-top: 10px;\n  margin-bottom: 10px;\n',
						])),
				),
				uo = wt.a.h2(ya || (ya = Object(Ct.a)(['\n  margin-bottom: 0px;\n']))),
				mo = wt.a.p(va || (va = Object(Ct.a)(['\n  margin-top: 20px;\n']))),
				jo = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.showNoLiveElections,
										n = e.showWelcome,
										a = e.showThankYou,
										o = e.showForm,
										c = e.onStallAdded;
									return Object(Bt.jsxs)(lo, {
										children: [
											t &&
												Object(Bt.jsxs)(po, {
													children: [
														Object(Bt.jsx)(uo, { children: "There aren't any live elections at the moment" }),
														Object(Bt.jsxs)(mo, {
															children: [
																"Thanks for your interest in submitting a stall, but there aren't any elections coming up that we're planning to cover. If you know of an election that you think we should cover, please get in touch with us at ",
																Object(Bt.jsx)('a', {
																	href: 'mailto:ausdemocracysausage@gmail.com',
																	children: 'ausdemocracysausage@gmail.com',
																}),
																" and we'll consider adding it.",
															],
														}),
													],
												}),
											n &&
												!1 === xe &&
												Object(Bt.jsxs)(po, {
													children: [
														Object(Bt.jsx)(uo, { children: 'Add your sausage sizzle or cake stall' }),
														Object(Bt.jsxs)(mo, {
															children: [
																'Please complete the form below to add your stall to the map. Please do not submit entries that are offensive, political or do not relate to an election day stall. Please also make sure that you have authorisation to run your fundraising event at the polling place. All entries are moderated and subject to approval.',
																Object(Bt.jsx)('br', {}),
																Object(Bt.jsx)('br', {}),
																'Having trouble submitting a stall? Email us at',
																' ',
																Object(Bt.jsx)('a', {
																	href: 'mailto:ausdemocracysausage@gmail.com',
																	children: 'ausdemocracysausage@gmail.com',
																}),
																'!',
															],
														}),
													],
												}),
											n &&
												!0 === xe &&
												Object(Bt.jsxs)(po, {
													children: [
														Object(Bt.jsx)(uo, { children: 'Send in your sausage sizzle or cake stall' }),
														Object(Bt.jsxs)(mo, {
															children: [
																'You can submit your stall by emailing us at',
																' ',
																Object(Bt.jsx)('a', {
																	href: 'mailto:ausdemocracysausage@gmail.com',
																	children: 'ausdemocracysausage@gmail.com',
																}),
																'.',
																Object(Bt.jsx)('br', {}),
																Object(Bt.jsx)('br', {}),
																'Please do not submit entries that are offensive, political or do not relate to an election day stall. Please also make sure that you have authorisation to run your fundraising event at the polling place. All entries are moderated and subject to approval.',
															],
														}),
													],
												}),
											a &&
												Object(Bt.jsxs)(po, {
													children: [
														Object(Bt.jsx)(uo, { children: 'Thank you' }),
														Object(Bt.jsx)(mo, {
															children:
																"Thanks for letting us know about your stall! We'll let you know once it's approved and it's appearing on the map.",
														}),
													],
												}),
											o && !1 === xe && Object(Bt.jsx)(io, { onStallAdded: c }),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				fo = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).state = { formSubmitted: !1 }),
							(a.onStallAdded = a.onStallAdded.bind(Object(Ot.a)(a))),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'onStallAdded',
								value: function () {
									this.setState({ formSubmitted: !0 });
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props.liveElections,
										t = this.state.formSubmitted,
										n = 0 === e.length;
									return Object(Bt.jsxs)(yt.Fragment, {
										children: [
											Object(Bt.jsxs)(zt.a, {
												children: [
													Object(Bt.jsx)('title', {
														children: 'Democracy Sausage | Add a sausage sizzle or cake stall to the map',
													}),
													Object(Bt.jsx)('meta', {
														property: 'og:url',
														content: ''.concat('https://public-legacy.staging.democracysausage.org', '/add-stall'),
													}),
													Object(Bt.jsx)('meta', {
														property: 'og:title',
														content: 'Democracy Sausage | Add a sausage sizzle or cake stall to the map',
													}),
												],
											}),
											Object(Bt.jsx)(jo, {
												showNoLiveElections: n,
												showWelcome: !t && !n,
												showThankYou: t && !n,
												showForm: !t && !n,
												onStallAdded: this.onStallAdded,
											}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				ho = Object(c.c)(
					function (e) {
						return { liveElections: A(e) };
					},
					function (e) {
						return {};
					},
				)(fo),
				bo = n(119),
				Oo = n.n(bo),
				xo = n(571),
				go = n.n(xo),
				yo = n(324),
				vo = n.n(yo),
				zo = n(153),
				Co = n(212),
				wo = n(262),
				_o = n.n(wo),
				So = n(400),
				Eo = n.n(So),
				ko = n(231),
				To = n.n(ko),
				Po = (n(2182), n(152)),
				Mo = n.n(Po),
				Ro = n(325),
				Ao = Object(wt.a)(u.b)(za || (za = Object(Ct.a)(['\n  position: relative !important;\n']))),
				Io = Object(wt.a)(Ro.Tabs)(
					Ca ||
						(Ca = Object(Ct.a)([
							'\n  /* Modify the active tab div */\n  & div div {\n    margin-top: 0px !important;\n  }\n',
						])),
				),
				Lo = Object(wt.a)(Ro.Tab)(
					wa ||
						(wa = Object(Ct.a)([
							'\n  white-space: normal;\n  padding-left: 12px !important;\n  padding-right: 12px !important;\n',
						])),
				),
				Fo = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Bt.jsx)(Lo, Object(v.a)({}, this.props));
								},
							},
						]),
						n
					);
				})(yt.Component);
			Fo.muiName = 'Tab';
			var No = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.electionsToShow,
										n = e.isHistoricalElectionShown,
										a = e.currentElection,
										o = e.browserBreakpoint,
										c = e.isResponsiveAndOverBreakPoint,
										s = e.onOpenElectionChooser,
										r = e.onChooseElectionTab;
									return Object(Bt.jsx)(Ao, {
										title: Object(Bt.jsxs)(Io, {
											onChange: function (e) {
												return r(e);
											},
											value: a.id,
											inkBarStyle: { backgroundColor: '#78C8AC' },
											children: [
												t.map(function (e) {
													return Object(Bt.jsx)(Fo, { label: B(t.length, e, n, o), value: e.id }, e.id);
												}),
												!0 === n && Object(Bt.jsx)(Fo, { label: 'Current Elections', value: -1 }),
											],
										}),
										iconStyleLeft: { display: 'none' },
										iconElementRight: Object(Bt.jsx)(Mo.a, {
											onClick: s,
											children:
												'iPhone' === navigator.platform
													? Object(Bt.jsx)(Rt.NavigationMoreHoriz, { color: 'rgba(255, 255, 255, 0.7)' })
													: Object(Bt.jsx)(Rt.NavigationMoreVert, { color: 'rgba(255, 255, 255, 0.7)' }),
										}),
										style: { paddingLeft: '0px', left: !0 === c ? '0px !important' : void 0 },
										zDepth: 0,
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Do = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.pageBaseURL,
										n = e.elections,
										a = e.liveElections,
										o = e.currentElection,
										c = e.browserBreakpoint,
										r = e.isResponsiveAndOverBreakPoint,
										i = e.onChooseElection,
										l = q(n, a, o),
										d = l.electionsToShow,
										p = l.isHistoricalElectionShown;
									return Object(Bt.jsx)(No, {
										electionsToShow: d,
										isHistoricalElectionShown: p,
										currentElection: o,
										browserBreakpoint: c,
										isResponsiveAndOverBreakPoint: r,
										onOpenElectionChooser: function () {
											return s.d.push(''.concat(t, '/elections'));
										},
										onChooseElectionTab: function (e) {
											-1 === e
												? (ca.event({
														category: 'ElectionAppBarContainer',
														action: 'onChooseCurrentElectionsTab',
														label: 'Go to Current Elections',
													}),
													s.d.push(t))
												: (ca.event({
														category: 'ElectionAppBarContainer',
														action: 'onClickElectionTab',
														label: 'Go to a specific election',
													}),
													i(
														n.find(function (t) {
															return t.id === e;
														}),
														t,
													));
										},
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				Uo = Object(c.c)(
					function (e) {
						var t = e.elections,
							n = e.browser;
						return {
							elections: t.elections,
							liveElections: A(e),
							currentElection: t.elections.find(function (e) {
								return e.id === t.current_election_id;
							}),
							defaultElection: t.elections.find(function (e) {
								return e.id === t.default_election_id;
							}),
							browserBreakpoint: n.mediaType,
						};
					},
					function (e) {
						return {
							onChooseElection: function (e, t) {
								s.d.push(''.concat(t, '/').concat(D(e)));
							},
						};
					},
				)(Do),
				Go = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								children: Object(Bt.jsx)('svg', {
									'aria-hidden': 'true',
									focusable: 'false',
									role: 'img',
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 448 512',
									children: Object(Bt.jsx)('path', {
										d: 'M448 80v352c0 26.5-21.5 48-48 48h-85.3V302.8h60.6l8.7-67.6h-69.3V192c0-19.6 5.4-32.9 33.5-32.9H384V98.7c-6.2-.8-27.4-2.7-52.2-2.7-51.6 0-87 31.5-87 89.4v49.9H184v67.6h60.9V480H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48z',
									}),
								}),
							},
						),
					);
				});
			(Go.displayName = 'FacebookIcon'), (Go.muiName = 'SvgIcon');
			var Bo = Go,
				Wo = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								children: Object(Bt.jsx)('svg', {
									'aria-hidden': 'true',
									focusable: 'false',
									role: 'img',
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 448 512',
									children: Object(Bt.jsx)('path', {
										d: 'M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z',
									}),
								}),
							},
						),
					);
				});
			(Wo.displayName = 'InstagramIcon'), (Wo.muiName = 'SvgIcon');
			var Vo = Wo,
				Ho = Object(Gt.a)(function (e) {
					return Object(Bt.jsx)(
						Ut.a,
						Object(v.a)(
							Object(v.a)({}, e),
							{},
							{
								children: Object(Bt.jsx)('svg', {
									'aria-hidden': 'true',
									focusable: 'false',
									role: 'img',
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 448 512',
									children: Object(Bt.jsx)('path', {
										d: 'M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-48.9 158.8c.2 2.8.2 5.7.2 8.5 0 86.7-66 186.6-186.6 186.6-37.2 0-71.7-10.8-100.7-29.4 5.3.6 10.4.8 15.8.8 30.7 0 58.9-10.4 81.4-28-28.8-.6-53-19.5-61.3-45.5 10.1 1.5 19.2 1.5 29.6-1.2-30-6.1-52.5-32.5-52.5-64.4v-.8c8.7 4.9 18.9 7.9 29.6 8.3a65.447 65.447 0 0 1-29.2-54.6c0-12.2 3.2-23.4 8.9-33.1 32.3 39.8 80.8 65.8 135.2 68.6-9.3-44.5 24-80.6 64-80.6 18.9 0 35.9 7.9 47.9 20.7 14.8-2.8 29-8.3 41.6-15.8-4.9 15.2-15.2 28-28.8 36.1 13.2-1.4 26-5.1 37.8-10.2-8.9 13.1-20.1 24.7-32.9 34z',
									}),
								}),
							},
						),
					);
				});
			(Ho.displayName = 'TwitterIcon'), (Ho.muiName = 'SvgIcon');
			var qo,
				Yo,
				Ko,
				Qo,
				Xo,
				Jo,
				Zo = Ho,
				$o = wt.a.div(
					qo ||
						(qo = Object(Ct.a)([
							"\n  font-family: 'Roboto', sans-serif;\n  height: 100%;\n  margin: 0px;\n  padding: 0px;\n",
						])),
				),
				ec = wt.a.div(
					Yo || (Yo = Object(Ct.a)(['\n  display: flex;\n  align-items: center;\n  font-size: 20px !important;\n'])),
				),
				tc = wt.a.img(Ko || (Ko = Object(Ct.a)(['\n  height: 32px;\n  margin-right: 10px;\n']))),
				nc = wt.a.a(Qo || (Qo = Object(Ct.a)(['\n  text-decoration: none;\n  color: inherit;\n']))),
				ac = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.muiThemePalette,
										n = e.locationPathName,
										a = e.locationPathNameMatch,
										o = e.contentMuiName,
										c = Object(Tt.a)(e, [
											'muiThemePalette',
											'locationPathName',
											'locationPathNameMatch',
											'contentMuiName',
										]);
									return (
										(('/' === a && 'SausageMapContainer' === o) ||
											('/search' === a && 'PollingPlaceFinderContainer' === o) ||
											('/sausagelytics' === a && 'SausagelyticsContainer' === o) ||
											a === n) &&
											((c.style = { color: t.accent1Color }),
											(c.leftIcon = yt.cloneElement(c.leftIcon, { color: t.accent1Color }))),
										Object(Bt.jsx)(Kn.ListItem, Object(v.a)({}, c))
									);
								},
							},
						]),
						n
					);
				})(yt.Component),
				oc = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.muiThemePalette,
										n = e.app,
										a = e.snackbars,
										o = e.currentElection,
										c = e.defaultBreakPoint,
										r = e.showElectionAppBar,
										i = e.showFooterNavBar,
										l = e.isResponsiveAndOverBreakPoint,
										d = e.handleSnackbarClose,
										p = e.onOpenDrawer,
										m = e.onClickDrawerLink,
										j = e.onClickOutboundDrawerLink,
										f = e.locationPathName,
										h = e.content,
										b = -1;
									'SausageMapContainer' === h.type.muiName
										? (b = 0)
										: 'PollingPlaceFinderContainer' === h.type.muiName
											? (b = 1)
											: '/add-stall' === f
												? (b = 2)
												: 'SausagelyticsContainer' === h.type.muiName && (b = 3);
									var O = {
										linearProgressStyle: {
											position: 'fixed',
											top: '0px',
											zIndex: 1200,
											display: n.requestsInProgress > 0 ? 'block' : 'none',
										},
										bodyContainerStyle: { display: 'flex', flexDirection: 'column', height: '100%' },
									};
									return (
										!0 === n.embedded_map && (O.bodyContainerStyle.inset = '0px'),
										Object(Bt.jsxs)($o, {
											children: [
												!1 === n.embedded_map &&
													Object(Bt.jsxs)(u.c, {
														breakPoint: c,
														children: [
															!0 === l &&
																Object(Bt.jsxs)(Kn.List, {
																	children: [
																		Object(Bt.jsx)(ac, {
																			primaryText: 'Map',
																			leftIcon: Object(Bt.jsx)(Rt.SocialPublic, {}),
																			containerElement: Object(Bt.jsx)(s.a, { to: '/'.concat(D(o)) }),
																			locationPathName: f,
																			locationPathNameMatch: '/',
																			muiThemePalette: t,
																			contentMuiName: h.type.muiName,
																		}),
																		Object(Bt.jsx)(ac, {
																			primaryText: 'Find',
																			leftIcon: Object(Bt.jsx)(Rt.ActionSearch, {}),
																			containerElement: Object(Bt.jsx)(s.a, { to: '/search/'.concat(D(o)) }),
																			locationPathName: f,
																			locationPathNameMatch: '/search',
																			muiThemePalette: t,
																			contentMuiName: h.type.muiName,
																		}),
																		Object(Bt.jsx)(ac, {
																			primaryText: 'Add Stall',
																			leftIcon: Object(Bt.jsx)(Rt.MapsAddLocation, {}),
																			containerElement: Object(Bt.jsx)(s.a, { to: '/add-stall' }),
																			locationPathName: f,
																			locationPathNameMatch: '/add-stall',
																			muiThemePalette: t,
																			contentMuiName: h.type.muiName,
																		}),
																	],
																}),
															!0 === l && Object(Bt.jsx)(_o.a, {}),
															Object(Bt.jsxs)(Kn.List, {
																children: [
																	!1 === l &&
																		Object(Bt.jsxs)(yt.Fragment, {
																			children: [
																				Object(Bt.jsx)(ac, {
																					primaryText: 'Map',
																					leftIcon: Object(Bt.jsx)(Rt.SocialPublic, {}),
																					containerElement: Object(Bt.jsx)(s.a, { to: '/'.concat(D(o)) }),
																					onClick: m,
																					locationPathName: f,
																					locationPathNameMatch: '/',
																					muiThemePalette: t,
																					contentMuiName: h.type.muiName,
																				}),
																				Object(Bt.jsx)(ac, {
																					primaryText: 'Add Stall',
																					leftIcon: Object(Bt.jsx)(Rt.MapsAddLocation, {}),
																					containerElement: Object(Bt.jsx)(s.a, { to: '/add-stall' }),
																					onClick: m,
																					locationPathName: f,
																					locationPathNameMatch: '/add-stall',
																					muiThemePalette: t,
																				}),
																			],
																		}),
																	Object(Bt.jsx)(ac, {
																		primaryText: 'Elections',
																		leftIcon: Object(Bt.jsx)(Rt.MapsLayers, {}),
																		containerElement: Object(Bt.jsx)(s.a, { to: '/elections' }),
																		onClick: m,
																		locationPathName: f,
																		locationPathNameMatch: '/elections',
																		muiThemePalette: t,
																	}),
																	Object(Bt.jsx)(ac, {
																		primaryText: 'Stats',
																		leftIcon: Object(Bt.jsx)(Rt.EditorInsertChart, {}),
																		containerElement: Object(Bt.jsx)(s.a, { to: '/sausagelytics/'.concat(D(o)) }),
																		onClick: m,
																		locationPathName: f,
																		locationPathNameMatch: '/sausagelytics',
																		muiThemePalette: t,
																		contentMuiName: h.type.muiName,
																	}),
																	Object(Bt.jsx)(ac, {
																		primaryText: 'Embed the map',
																		leftIcon: Object(Bt.jsx)(Rt.ActionCode, {}),
																		containerElement: Object(Bt.jsx)(s.a, { to: '/embed-builder' }),
																		onClick: m,
																		locationPathName: f,
																		locationPathNameMatch: '/embed-builder',
																		muiThemePalette: t,
																	}),
																	Object(Bt.jsx)(ac, {
																		primaryText: 'FAQs and About Us',
																		leftIcon: Object(Bt.jsx)(Rt.ActionInfo, {}),
																		containerElement: Object(Bt.jsx)(s.a, { to: '/about' }),
																		onClick: m,
																		locationPathName: f,
																		locationPathNameMatch: '/about',
																		muiThemePalette: t,
																	}),
																	Object(Bt.jsx)(ac, {
																		primaryText: 'Media',
																		leftIcon: Object(Bt.jsx)(Rt.HardwareTv, {}),
																		containerElement: Object(Bt.jsx)(s.a, { to: '/media' }),
																		onClick: m,
																		locationPathName: f,
																		locationPathNameMatch: '/media',
																		muiThemePalette: t,
																	}),
																	Object(Bt.jsx)(Kn.ListItem, {
																		primaryText: 'Redbubble Store',
																		leftIcon: Object(Bt.jsx)(Rt.ActionStore, {}),
																		onClick: function (e) {
																			return j(e, 'Redbubble Store');
																		},
																		containerElement: Object(Bt.jsx)('a', {
																			href: 'https://www.redbubble.com/people/demsausage/shop',
																		}),
																	}),
																],
															}),
															Object(Bt.jsx)(_o.a, {}),
															Object(Bt.jsxs)(Kn.List, {
																children: [
																	Object(Bt.jsx)(To.a, { children: 'Contact Us' }),
																	Object(Bt.jsx)(Kn.ListItem, {
																		primaryText: 'Email',
																		leftIcon: Object(Bt.jsx)(Rt.CommunicationEmail, {}),
																		onClick: function (e) {
																			return j(e, 'Email');
																		},
																		containerElement: Object(Bt.jsx)('a', {
																			href: 'mailto:ausdemocracysausage@gmail.com',
																		}),
																	}),
																	Object(Bt.jsx)(Kn.ListItem, {
																		primaryText: 'Twitter',
																		leftIcon: Object(Bt.jsx)(Zo, {}),
																		onClick: function (e) {
																			return j(e, 'Twitter');
																		},
																		containerElement: Object(Bt.jsx)('a', { href: 'https://twitter.com/DemSausage' }),
																	}),
																	Object(Bt.jsx)(Kn.ListItem, {
																		primaryText: 'Facebook',
																		leftIcon: Object(Bt.jsx)(Bo, {}),
																		onClick: function (e) {
																			return j(e, 'Facebook');
																		},
																		containerElement: Object(Bt.jsx)('a', {
																			href: 'https://www.facebook.com/AusDemocracySausage',
																		}),
																	}),
																	Object(Bt.jsx)(Kn.ListItem, {
																		primaryText: 'Instagram',
																		leftIcon: Object(Bt.jsx)(Vo, {}),
																		onClick: function (e) {
																			return j(e, 'Instagram');
																		},
																		containerElement: Object(Bt.jsx)('a', {
																			href: 'https://www.instagram.com/ausdemocracysausage/',
																		}),
																	}),
																],
															}),
														],
													}),
												Object(Bt.jsxs)(u.a, {
													breakPoint: c,
													style: O.bodyContainerStyle,
													children: [
														Object(Bt.jsx)(Oo.a, {
															mode: 'indeterminate',
															color: t.accent3Color,
															style: O.linearProgressStyle,
														}),
														!1 === n.embedded_map &&
															Object(Bt.jsx)(u.b, {
																breakPoint: c,
																onLeftIconButtonClick: p,
																title: Object(Bt.jsxs)(ec, {
																	children: [
																		Object(Bt.jsx)(tc, { src: '/icons/sausage+cake_big.png' }),
																		' Democracy Sausage',
																	],
																}),
																zDepth: 0,
																style: { position: 'relative', left: !0 === l ? '0px !important' : void 0 },
															}),
														!0 === n.embedded_map &&
															Object(Bt.jsx)(Pt.a, {
																title: Object(Bt.jsxs)(ec, {
																	children: [
																		Object(Bt.jsx)(tc, { src: '/icons/sausage+cake_big.png' }),
																		' ',
																		Object(Bt.jsx)(nc, {
																			href: ''.concat('https://public-legacy.staging.democracysausage.org'),
																			target: '_parent',
																			children: 'Democracy Sausage',
																		}),
																	],
																}),
																showMenuIconButton: !1,
																zDepth: 0,
																style: { position: 'fixed', bottom: 0, width: '100%' },
															}),
														!0 === r &&
															!1 === n.embedded_map &&
															Object(Bt.jsx)(Uo, {
																isResponsiveAndOverBreakPoint: l,
																pageTitle: h.type.pageTitle,
																pageBaseURL: h.type.pageBaseURL,
															}),
														Object(Bt.jsx)('div', { className: 'page-content', children: h || this.props.children }),
														!1 === l &&
															!0 === i &&
															Object(Bt.jsx)(Da.a, {
																zDepth: 1,
																className: 'page-footer',
																children: Object(Bt.jsxs)(Co.BottomNavigation, {
																	selectedIndex: b,
																	children: [
																		Object(Bt.jsx)(Co.BottomNavigationItem, {
																			label: 'Map',
																			icon: Object(Bt.jsx)(Rt.SocialPublic, {}),
																			onClick: function () {
																				return s.d.push('/'.concat(D(o)));
																			},
																		}),
																		Object(Bt.jsx)(Co.BottomNavigationItem, {
																			label: 'Find',
																			icon: Object(Bt.jsx)(Rt.ActionSearch, {}),
																			onClick: function () {
																				return s.d.push('/search/'.concat(D(o)));
																			},
																		}),
																		Object(Bt.jsx)(Co.BottomNavigationItem, {
																			label: 'Add Stall',
																			icon: Object(Bt.jsx)(Rt.MapsAddLocation, {}),
																			onClick: function () {
																				return s.d.push('/add-stall');
																			},
																		}),
																		Object(Bt.jsx)(Co.BottomNavigationItem, {
																			label: 'Stats',
																			icon: Object(Bt.jsx)(Rt.EditorInsertChart, {}),
																			onClick: function () {
																				return s.d.push('/sausagelytics/'.concat(D(o)));
																			},
																		}),
																	],
																}),
															}),
													],
												}),
												Object(Bt.jsx)(Eo.a, {
													open: a.open,
													message: a.active.message,
													action: a.active.action,
													autoHideDuration: a.active.autoHideDuration,
													onActionClick: function () {
														'onActionClick' in a.active && a.active.onActionClick();
													},
													onRequestClose: d,
													bodyStyle: { height: 'auto', lineHeight: '22px', padding: 24, whiteSpace: 'pre-line' },
												}),
											],
										})
									);
								},
							},
						]),
						n
					);
				})(yt.Component);
			function cc() {
				return (cc =
					Object.assign ||
					function (e) {
						for (var t = 1; t < arguments.length; t++) {
							var n = arguments[t];
							for (var a in n) Object.prototype.hasOwnProperty.call(n, a) && (e[a] = n[a]);
						}
						return e;
					}).apply(this, arguments);
			}
			function sc(e, t) {
				if (null == e) return {};
				var n,
					a,
					o = (function (e, t) {
						if (null == e) return {};
						var n,
							a,
							o = {},
							c = Object.keys(e);
						for (a = 0; a < c.length; a++) (n = c[a]), t.indexOf(n) >= 0 || (o[n] = e[n]);
						return o;
					})(e, t);
				if (Object.getOwnPropertySymbols) {
					var c = Object.getOwnPropertySymbols(e);
					for (a = 0; a < c.length; a++)
						(n = c[a]), t.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, n) && (o[n] = e[n]));
				}
				return o;
			}
			function rc(e, t) {
				var n = e.title,
					a = e.titleId,
					o = sc(e, ['title', 'titleId']);
				return yt.createElement(
					'svg',
					cc(
						{
							viewBox: '0 0 640 580',
							fillRule: 'evenodd',
							clipRule: 'evenodd',
							strokeLinecap: 'round',
							strokeLinejoin: 'round',
							ref: t,
							'aria-labelledby': a,
						},
						o,
					),
					n ? yt.createElement('title', { id: a }, n) : null,
					Xo ||
						(Xo = yt.createElement(
							'g',
							{ fillRule: 'nonzero' },
							yt.createElement('path', {
								d: 'M191.765 435.892c0 45.309 86.707 82.035 193.27 82.035 106.569 0 192.959-36.726 192.959-82.035V273.696H191.765v162.196z',
								fill: 'url(#_Radial1)',
							}),
							yt.createElement('path', {
								d: 'M188.455 264.307c0 5.267-10.593 32.882 3.431 32.882 8.498 0 5.067-11.152 12.465-2.819 25.869 29.12 33.335 80.492 60.463 105.836 12.927 12.079 30.416 7.841 45.342 15.03 22.43 10.795 15.136 45.712 44.586 45.712 25.711 0 17.125-48.061 42.366-48.061 26.614 0 28.611 32.408 46.286 32.408 22.904 0 12.208-53.466 35.061-75.149 33.654-31.937 59.631-10.101 54.692 8.924-5.607 21.605 1.79 39.923 12.156 39.923 16.362 0 12.538-32.147 11.687-40.862-2.337-23.954 8.865-40.381 17.767-47.438 13.647-10.817 10.282-53.021 10.282-65.99 0-43.966-66.577-87.44-201.21-87.44-139.627-.01-195.376 43.068-195.376 87.039l.002.005z',
								fill: 'url(#_Radial2)',
							}),
							yt.createElement('path', {
								d: 'M187.828 256.791c0 5.265-10.59 32.88 3.434 32.88 8.495 0 5.068-11.152 12.469-2.817 25.869 29.119 33.328 80.491 60.459 105.835 12.924 12.08 30.416 7.842 45.338 15.03 22.435 10.796 15.433 46.968 44.88 46.968 25.711 0 16.831-49.316 42.073-49.316 26.614 0 28.61 32.408 46.289 32.408 22.904 0 12.204-53.467 35.061-75.149 33.652-31.938 59.627-10.101 54.688 8.924-5.603 21.605 1.794 39.923 12.157 39.923 16.361 0 12.542-32.148 11.687-40.863-2.337-23.954 8.861-40.381 17.771-47.437 13.642-10.818 10.277-53.022 10.277-65.99 0-43.967-66.572-87.441-201.209-87.441-139.609-.009-195.358 43.068-195.358 87.039l-.016.006z',
								fill: 'url(#_Radial3)',
							}),
							yt.createElement('path', {
								d: 'M496.232 208.567c0 21.444-50.75 38.829-113.352 38.829-62.603 0-113.352-17.385-113.352-38.829 0-21.439 50.751-38.825 113.352-38.825 62.598 0 113.352 17.386 113.352 38.825z',
								fill: 'url(#_Radial4)',
							}),
							yt.createElement('path', {
								d: 'M462.139 151.579s6.887-25.986-10.96-31.306c-17.848-5.328-87.671-7.203-92.996 0-5.324 7.199 103.954 31.306 103.954 31.306h.002z',
								fill: 'url(#_Radial5)',
							}),
							yt.createElement('path', {
								d: 'M358.496 103.673s-75.486 18.354-84.854 61.373c-10.021 46.029 22.856 60.742 122.12 77.027 35.354 5.795-37.263-138.405-37.263-138.405l-.003.005z',
								fill: 'url(#_Radial6)',
							}),
							yt.createElement('path', {
								d: 'M357.875 111.819s-57.612 9.077-59.18 46.028c-1.567 36.943 35.068 66.063 54.795 71.699 19.726 5.636 26.299-9.393 23.796-32.877-2.493-23.482-19.399-84.848-19.399-84.848l-.012-.002z',
								fill: 'url(#_Radial7)',
							}),
							yt.createElement('path', {
								d: 'M353.18 109.94s-48.846 10.956-48.846 43.519c0 32.569 31.623 39.767 44.462 42.271 12.838 2.51 53.231 23.175 53.231 33.193 0 10.017.312 12.527.312 12.527s27.557-24.115 34.444-24.738c6.896-.621-83.596-106.767-83.596-106.767l-.007-.005z',
								fill: 'url(#_Radial8)',
							}),
							yt.createElement('path', {
								d: 'M415.92 84.996c12.34 14.329 15.921 31.086 9.048 43.28-9.434 16.728-41.552 29.424-68.052 15.928-19.947-10.146-21.532-38.439-11.804-54.999 11.397-19.399 33.681-34.562 50.155-27.656 11.59 4.832 12.559 14.038 20.659 23.447h-.006z',
								fill: 'url(#_Radial9)',
							}),
							yt.createElement('path', {
								d: 'M408.497 75.272s-8.854-10.586-14.208-8.403c-4.25 1.725 4.367 11.555 6.571 15.47 2.206 3.922 17.441 23.583 22.222 21.587 4.779-2-9.154-19.598-14.582-28.654h-.003z',
								fill: 'url(#_Radial10)',
							}),
							yt.createElement('path', {
								d: 'M417.641 94.392c-1.512 4.881-6.421-1.636-9.588-4.172-5.412-4.363-7.731-10.949-6.407-12.608 1.574-1.981 4.411-1.486 8.745 3.519 5.099 5.875 8.316 9.843 7.244 13.261h.006z',
								fill: 'url(#_Radial11)',
							}),
							yt.createElement('path', {
								d: 'M356.915 144.204c26.5 13.497 58.618.801 68.052-15.928 1.522-2.705 2.451-5.655 2.96-8.73-1.335-3.423-2.795-6.704-4.157-8.751-4.525-6.722-8.245-8.611-8.245-8.611s5.193 14.064-8.766 17.929c-12.967 3.591-49.69 17.466-67.317-4.991.827 11.891 6.237 23.369 17.47 29.082h.003z',
								fill: 'url(#_Radial12)',
							}),
							yt.createElement('path', {
								d: 'M355.429 85.352c6.788-6.811 27.637-18.59 30.111-22.464 1.038-1.629 4.194-2.084 7.533-2.077-16.211-4.785-37.067 9.826-47.965 28.393-3.559 6.074-5.588 13.724-5.764 21.47 1.674-3.259 10-19.221 16.087-25.322h-.002z',
								fill: 'url(#_Radial13)',
							}),
							yt.createElement('path', {
								d: 'M373.764 82.563s4.539-6.098 12.631-1.28c8.091 4.815 13.444 11.272 14.057 15.091.623 3.81-7.673.753-12.865-3.284-5.203-4.039-15.353-6.642-13.829-10.527h.006z',
								fill: 'url(#_Radial14)',
							}),
							yt.createElement('path', {
								d: 'M380.97 81.793s6.894 1.647 8.748 3.989c1.83 2.322 5.446 5.801 4.41 6.898-1.035 1.116-6.971-4.238-7.526-4.516-.565-.291-13.801-3.297-5.635-6.371h.003z',
								fill: 'url(#_Radial15)',
							}),
							yt.createElement('path', {
								d: 'M349.107 119.641s-15.342 15.346-15.342 38.202c0 22.855 20.042 32.25 34.444 32.25 14.403 0 34.753 4.072 44.774 13.466 10.021 9.393 15.65 15.969 30.682 18.159 15.034 2.19 34.137 3.445 35.388-4.693 1.251-8.138-129.947-97.378-129.947-97.378l.001-.006z',
								fill: 'url(#_Radial16)',
							}),
							yt.createElement('path', {
								d: 'M439.599 184.465c19.851 12.23 45.254 9.731 54.17 11.9 0 0 14.402-20.357 6.575-32.569-7.826-12.211-25.678-19.722-38.513-20.973-12.835-1.255-41.019-10.961-54.482-15.97-13.463-5.012-30.683 2.187-33.189 8.762-2.506 6.576-5.008 15.03-5.008 15.03s39.446 14.712 70.444 33.819l.003.001z',
								fill: 'url(#_Radial17)',
							}),
							yt.createElement('path', {
								d: 'M350.678 123.091s-7.2 18.787 13.778 26.302c20.977 7.515 53.859 15.338 67.633 31.306 13.776 15.97 41.021 46.968 48.847 38.829 7.827-8.138 26.926-25.671 12.836-30.999-14.091-5.321-48.847-1.563-60.118-13.151-11.272-11.588-21.297-15.345-38.829-20.665-17.545-5.316-31.628-8.135-44.15-31.618l.003-.004z',
								fill: 'url(#_Radial18)',
							}),
							yt.createElement('path', {
								d: 'M387.499 481.604c89.83 0 165.818-20.897 190.984-49.65-.012 4.216-.019 8.069-.019 11.453 0 45.309-86.641 82.035-193.505 82.035-106.87 0-193.514-36.726-193.514-82.035 0-6.37-.007-12.509-.015-18.589 18.054 32.381 98.968 56.793 196.073 56.793l-.004-.007z',
								fill: 'url(#_Radial19)',
							}),
							yt.createElement('path', {
								d: 'M535.255 210.43c18.076 9.633 28.61 21.103 28.61 33.432 0 34.018-79.907 61.593-178.48 61.593-94.801 0-172.31-25.516-178.086-57.733-.232 1.343-.386 2.693-.386 4.058 0 36.316 82.715 65.755 184.737 65.755 102.022 0 184.737-29.439 184.737-65.755 0-15.663-15.419-30.048-41.13-41.346l-.002-.004z',
								fill: 'url(#_Radial20)',
							}),
							yt.createElement('path', {
								d: 'M478.696 346.652s65.756-45.089 69.513 25.363c-9.398-15.024-7.517-40.387-69.513-25.363z',
								fill: 'url(#_Radial21)',
							}),
							yt.createElement('path', {
								d: 'M552.903 378.591s-.47 20.196-6.575 29.12c14.092.009 6.575-29.117 6.575-29.117v-.003z',
								fill: 'url(#_Radial22)',
							}),
							yt.createElement('path', {
								d: 'M502.065 203.055c.085 1.233.129 2.469.129 3.713 0 38.498-46.296 84.395-97.707 85.407 35.695 6.575 149.524-15.029 149.524-51.12 0-16.586-21.12-30.942-51.949-38.007l.003.007z',
								fill: 'url(#_Radial23)',
							}),
							yt.createElement('path', {
								d: 'M470.709 364.743s-16.438 20.901-16.438 44.854c0 23.954-10.802 27.711-17.848 17.848 10.959-.316 11.899-9.548 11.899-19.411 0-9.864.781-32.814 22.381-43.294l.006.003z',
								fill: 'url(#_Radial24)',
							}),
							yt.createElement('path', {
								d: 'M397.283 400.52s-16.284.624-22.544 17.217c-6.26 16.599-16.597 45.404-33.817 25.054 13.779 4.065 18.48-4.705 25.678-19.103 7.207-14.403 12.531-24.422 30.688-23.162l-.005-.006z',
								fill: 'url(#_Radial25)',
							}),
							yt.createElement('path', {
								d: 'M530.363 307.206s36.635-16.909 47.907-34.756c0 19.726 3.757 31.937-5.636 43.211-9.393 11.271-16.908 21.605-18.787 30.059-5.635-20.659-7.517-35.693-23.481-38.506l-.003-.008z',
								fill: 'url(#_Radial26)',
							}),
							yt.createElement(
								'g',
								null,
								yt.createElement('path', {
									d: 'M86.869 298.274c-12.478-242.018 97.174-59.142 161.829 13.219 59.541 47.742 186.234 130.611 186.234 130.611s-3.957 42.372-.207 43.026c0 0-62.645 27.301-63.794 27.636-31.88-5.832-64.671-23.176-92.331-39.779-19.371-10.834-62.804-42.507-79.231-57.778-44.749-34.274-77.699-74.188-112.5-116.935z',
									fill: '#dec5a3',
								}),
								yt.createElement('path', {
									d: 'M85.959 311.509c-1.914-3.023-8.201-12.932-13.961-22.019-5.761-9.079-12.063-20.648-14.01-25.706-1.939-5.058-4.907-11.409-6.59-14.113-5.64-9.071-6.973-17.313-5.265-32.479 1.108-9.782 3.622-17.752 7.172-22.73 3.008-4.221 6.231-8.768 7.156-10.116 1.269-1.843-.024-2.825-5.186-3.974-3.781-.837-7.276-2.72-7.754-4.172-2.537-7.659 21.421-35.95 26.272-31.027 5.074 5.146 6.709 9.645 5.768 15.852-.766 5.003-.144 6.878 2.362 7.125 1.866.183 4.188-.303 5.153-1.085 3.176-2.569 28.682-.886 31.091 2.058 1.293 1.58 3.59 3.056 5.09 3.279 9.191 1.357 18.183 10.236 60.866 60.132 43.497 50.844 67.758 75.672 96.073 98.33 30.053 24.047 35.862 28.275 56.836 41.263 37.019 22.946 51.571 31.49 54.666 32.097 5.601 1.109 35.2 24.979 41.886 33.787 6.342 8.353 9.534 16.978 10.746 29.009.75 7.475 1.596 13.866 1.867 14.209.279.343 2.553-1.101 5.042-3.207 5.785-4.875 11.369-.415 10.324 8.257-1.268 10.475-1.348 11.959-1.021 19.554.359 8.441-2.705 11.896-10.22 11.521-4.787-.24-5.329-.822-6.702-7.308-2.345-11.05-5.584-11.401-16.746-1.803-9.526 8.193-35.12 18.828-37.705 15.669-.582-.702-1.747-.71-2.593-.016-2.082 1.699-19.546-.016-29.614-2.912-30.7-8.84-101.993-46.983-125.098-66.921-10.651-9.199-35.415-29.495-43.377-35.559-3.399-2.584-15.406-13.451-26.679-24.149-11.281-10.699-24.804-23.456-30.054-28.355-9.669-9.015-39.388-44.382-45.795-54.491zm78.529-32.199c10.005-8.138 13.204-7.963 20.895 1.109 6.112 7.204 6.431 8.68 4.492 20.495l-2.09 12.726 11.217.622 11.225.63 2.434 9.063c2.68 9.965 5.903 11.25 13.283 5.29 1.963-1.58 5.457-2.513 7.755-2.067 3.407.663 4.125 1.788 3.917 6.072-.143 2.888 1.5 7.412 3.654 10.044 2.362 2.88 3.662 8.002 3.287 12.893-.63 8.058 2.434 11.624 6.877 7.986 5.832-4.779 14.034-4.946 17.792-.351 2.09 2.553 3.43 5.713 2.976 7.037-1.317 3.821 5.512 10.818 8.321 8.521 3.055-2.506 18.788 4.156 23.551 9.972 1.931 2.362 6.327 5.178 9.758 6.255 5.903 1.859 6.382 2.521 8.704 12.287l2.457 10.323 4.931-4.029c6.414-5.257 13.85-2.625 16.052 5.689.829 3.151 1.874 5.736 2.313 5.736.439 0 3.215-.511 6.159-1.125 3.503-.734 6.606.407 8.976 3.303 1.986 2.433 6.717 4.827 10.507 5.329 6.279.822 7.093 1.54 9.095 8.066 3.798 12.359 6.526 14.656 12.646 10.667 7.842-5.114 10.275-4.26 21.429 7.46l9.997 10.499-3.902-12.805c-4.531-14.863-10.172-20.296-18.733-18.031-5.257 1.389-6.167.822-10.642-6.701-4.285-7.189-5.912-8.353-12.845-9.207-9.063-1.125-18.43-5.936-19.842-10.196-.526-1.596-3.622-3.032-6.869-3.191-3.255-.168-7.156-1.811-8.672-3.662-1.516-1.851-5.106-3.718-7.986-4.149-4.883-.734-5.394-1.548-7.628-12.135-2.688-12.789-5.473-15.709-10.802-11.345-6.446 5.274-14.273 4.34-21.485-2.585-3.67-3.526-8.944-8.074-11.704-10.116-3.391-2.489-5.856-6.765-7.547-13.076-2.442-9.079-2.665-9.351-7.069-8.696-18.709 2.8-24.334-1.261-24.605-17.736-.207-12.701-3.087-16.985-8.473-12.581-6.414 5.257-14.512 2.752-20.041-6.207-2.625-4.261-6.622-8.338-8.951-9.119-3.295-1.117-4.229-3.04-4.348-8.92-.144-7.499-.144-7.499-6.901-8.999-7.189-1.596-13.587-7.635-12.239-11.569.479-1.396-2.401-3.183-6.989-4.348l-7.81-1.978 2.05-10.883 2.05-10.874-8.576 2.122c-4.715 1.173-8.848 1.803-9.175 1.397-.327-.399-1.284-3.989-2.13-7.971-1.452-6.837-1.907-7.3-8.026-8.105-8.361-1.093-12.478-6.271-12.973-16.316-.311-6.183-1.34-8.353-4.499-9.438-2.25-.782-6.072-4.523-8.489-8.313-4.42-6.941-10.779-9.949-14.536-6.877-1.253 1.029-.032 3.478 3.366 6.757 4.349 4.205 4.915 6.111 3.08 10.404-3.255 7.603-3.303 7.531 4.643 7.38 8.712-.176 11.385 2.584 11.569 11.951.119 6.422.622 7.18 5.816 8.816 8.624 2.712 14.855 11.377 11.496 15.996-2.744 3.774-.582 6.829 7.994 11.353 2.394 1.26 3.024 4.978 2.075 12.246-.75 5.737-.91 11.002-.367 11.704.55.702 4.196-1.324 8.105-4.499zm268.745 167.357c1.388-1.141 1.284-3.534-.232-5.385-1.516-1.859-3.845-2.425-5.233-1.292-1.389 1.141-1.293 3.534.231 5.393 1.516 1.851 3.846 2.425 5.234 1.284z',
									fill: '#c25628',
								}),
								yt.createElement('path', {
									d: 'M99.355 327.721c-1.029-3.295 3.263-7.38 5.233-4.978.75.917 2.913.399 4.795-1.149 1.891-1.54 2.45-3.152 1.245-3.566-1.205-.415-1.612-1.971-.91-3.463.703-1.492-.151-1.013-1.906 1.061-2.067 2.449-3.854 2.952-5.098 1.42-1.061-1.292-2.912-1.635-4.117-.766-1.516 1.085-1.803.846-.926-.774 1.381-2.553-4.914-8.161-7.132-6.35-.742.614-.295 3.063.997 5.457 1.811 3.359 1.349 3.231-2.042-.559-2.418-2.696-4.229-6.598-4.021-8.672.271-2.712-.415-3.67-2.449-3.422-1.628.191-4.444-2.362-6.622-6.024l-3.798-6.359 6.351 1.476c4.348 1.014 5.72.679 4.364-1.069-1.093-1.404-2.17-4.284-2.394-6.406-.359-3.415 0-3.718 3.287-2.689 2.027.638 3.008.303 2.178-.742-.837-1.045-3.406-1.915-5.72-1.93-2.904-.024-3.734.55-2.673 1.842.846 1.03.886 2.402.096 3.048-.79.646-2.84-1.125-4.556-3.933-2.92-4.787-3.023-4.787-1.691-.008 1.723 6.199.527 7.643-2.88 3.478-1.388-1.691-2.441-6.039-2.338-9.661.104-3.614-.51-7.38-1.364-8.369-.854-.982-1.46.574-1.348 3.462.199 5.178.167 5.202-2.521 1.923-1.492-1.827-2.617-4.603-2.489-6.159.127-1.564-1.245-5.393-3.056-8.513-1.803-3.119-3.885-7.579-4.619-9.909-.902-2.864-1.636-3.382-2.242-1.603-.503 1.452-1.7-.806-2.657-5.034-2.84-12.43.822-35.703 6.973-44.319 3.008-4.221 6.231-8.768 7.156-10.116 1.269-1.843-.024-2.825-5.186-3.974-8.799-1.946-9.637-4.874-4.34-15.158 5.035-9.757 12.933-16.866 16.555-14.879 2.034 1.117 2.234.957.973-.798-.869-1.205-.454-3.12.926-4.245 4.739-3.877 11.544 6.662 10.172 15.733-.766 5.003-.144 6.878 2.362 7.125 1.866.183 4.204-.327 5.193-1.133 2.912-2.385 30.421-.614 30.198 1.947-.112 1.292-2.96 1.97-6.343 1.516-3.383-.463-10.419-.687-15.645-.503-8.696.295-9.534.734-9.973 5.178-.263 2.664-.12 4.547.335 4.18.447-.367 2.537-1.244 4.644-1.938 2.608-.862 2.935-1.572 1.021-2.234-1.54-.527-2.011-1.612-1.037-2.41.973-.798 2.385-.694 3.135.224.75.917 2.577.67 4.061-.543 1.771-1.444 3.271-.957 4.356 1.396 1.037 2.258 5.441 3.965 11.76 4.548 10.244.949 12.43-.926 2.776-2.378-2.896-.43-4.452-1.452-3.454-2.265 2.505-2.051 15.764 1.125 16.131 3.869.16 1.229 2.498 2.457 5.186 2.721 2.689.271 4.763 1.38 4.612 2.473-.16 1.093-1.389 1.324-2.745.51-1.356-.821-2.808-.502-3.223.71-.415 1.205-2.019.647-3.566-1.244-1.588-1.947-3.902-2.545-5.314-1.388-1.38 1.125-3.223 1.172-4.101.103-.877-1.069-1.659-1.228-1.747-.343-.087.878 2.138 2.92 4.947 4.532 3.925 2.258 4.723 3.606 3.454 5.832-1.141 2.002-2.617 1.715-4.787-.934-2.784-3.406-15.142-6.111-17.839-3.909-.566.471 1.428 3.032 4.436 5.689 4.619 4.084 5.218 6.031 3.79 12.469l-1.692 7.636 7.308-.415c8.553-.487 12.446 3.287 11.297 10.93-.797 5.289 2.139 15.182 3.407 11.488.343-.997 3.096-.606 6.119.886 5.705 2.8 9.805 9.677 7.093 11.903-4.915 4.021-7.627 10.954-5.274 13.475 1.349 1.452 1.572 1.237.926-.853-1.364-4.348 1.899-5.633 4.922-1.947 1.5 1.843 3.487 2.729 4.404 1.979 3.455-2.833 5.593 3.845 4.444 13.906-1.229 10.706.351 12.828 6.056 8.145 2.712-2.218 3.263-1.954 3.239 1.532-.024 3.439.454 3.814 2.64 2.027 2.099-1.724 3.351-.886 5.92 3.941 2.13 4.013 3.558 5.273 4.117 3.646 1.237-3.598-3.55-11.521-8.249-13.667-3.583-1.627-3.447-1.715 1.22-.734 2.896.607 4.532.208 3.638-.885-.893-1.093-.79-2.673.232-3.511 1.125-.917 2.146 1.109 2.569 5.09.383 3.638 1.922 7.316 3.422 8.17 1.492.854 2.082 2.561 1.301 3.79-.782 1.236.606 1.324 3.079.183 3.894-1.787 3.941-2.473.335-5.154-2.289-1.699-4.491-4.898-4.882-7.1-.503-2.833 1.069-1.644 5.337 4.037 5.194 6.909 5.8 9.494 4.284 18.301-2.026 11.8-1.013 13.779 7.229 14.186 4.092.207 6.661 1.755 8.153 4.914 1.197 2.545 2.928 3.989 3.87 3.215.933-.766.686-2.752-.559-4.42-1.244-1.659-1.173-2.433.16-1.707 1.332.718 3.087 4.3 3.893 7.954 1.763 7.947 5.242 10.532 9.478 7.069 1.707-1.396 4.133-2.186 5.393-1.755 1.261.439 3.048-.535 3.973-2.154.926-1.62 2.402-2.075 3.279-1.006.87 1.078.264 2.123-1.348 2.338-1.97.263-1.859 1.013.335 2.266 1.795 1.021 2.88 3 2.41 4.38-.479 1.388.957 4.045 3.183 5.912 5.68 4.739 3.869 7.818-2.019 3.438-3.542-2.625-4.515-4.795-3.646-8.145.647-2.506.288-3.822-.805-2.928-1.093.893-3.136.367-4.532-1.173s-1.173.375.495 4.252c1.667 3.878 4.515 8.13 6.326 9.446 1.819 1.317 2.96 3.399 2.537 4.612-.414 1.22.264 2.561 1.516 2.991 1.245.431 2.617-.223 3.04-1.452 1.388-4.052 1.827-1.053.893 6.104-.829 6.302-1.164 6.701-3.175 3.781-1.699-2.465-3.103-2.337-5.736.511-2.21 2.393-3.614 2.784-3.846 1.061-.462-3.462-2.704-1.612-4.076 3.359-.79 2.88-.367 3.606 1.723 2.96 3.861-1.197 8.56 5.09 5.616 7.507-1.324 1.077-2.265 3.024-2.09 4.316.192 1.436 1.779.232 4.085-3.095 3.008-4.348 3.981-4.827 4.787-2.37.566 1.7.088 3.208-1.053 3.359-1.141.152-1.923 1.444-1.731 2.872.191 1.428-.703 2.737-1.995 2.912-3.191.423-2.162 1.349 4.875 4.372 3.295 1.413 5.816 1.684 5.608.599-.207-1.085.08-1.101.647-.024 2.305 4.388 9.932 7.06 11.632 4.085 1.3-2.282.694-3.487-2.402-4.771-5.321-2.21-7.507-4.907-5.385-6.646.917-.75 2.593-.231 3.726 1.157 2.784 3.398 21.046 12.007 22.666 10.682 2.297-1.882-2.713-10.036-6.024-9.813-2.289.152-2.321-.175-.135-1.141 1.691-.749 4.555.455 6.366 2.665 1.907 2.33 4.029 3.128 5.034 1.899.966-1.165 2.705-.949 3.878.479s2.505 1.523 2.952.207c.454-1.324 1.412-1.683 2.13-.814.71.878.471 3.04-.535 4.811-1.013 1.771-.542 3.957 1.053 4.867 1.819 1.037 1.835 1.994.04 2.593-1.699.558-3.893-.966-5.417-3.79-1.452-2.665-3.359-4.077-4.38-3.239-.997.814-.526 2.21 1.045 3.111 2.809 1.596 1.213 8.832-2.425 10.978-1.013.607-1.029 2.617-.024 4.476 2.242 4.149 5.018 2.218 5.633-3.909.941-9.486 4.683-6.726 4.651 3.43-.016 3.694-.048 8.25-.072 10.125-.072 4.946 1.46 6.127 8.186 6.279 7.387.159 9.047-5.402 1.827-6.12-4.987-.494-10.819-5.696-6.965-6.215 1.228-.159 1.93-3.167 1.555-6.669-.574-5.442.032-6.471 4.157-6.997 6.183-.798 6.877 3.111.766 4.316-3.83.758-4.037 1.229-1.221 2.84 1.867 1.061 2.354 2.074 1.093 2.25-1.268.183-2.425 2.369-2.577 4.875-.247 4.053.136 3.965 3.551-.766 2.114-2.92 4.747-6.112 5.864-7.093 1.117-.973 1.555-2.353.981-3.056-.582-.702-1.923-3.877-2.984-7.044-1.612-4.819-1.26-5.705 2.146-5.362 10.244 1.022 13.858 4.133 15.478 13.324 1.595 9.047 4.986 13.77 9.725 13.523 1.692-.096 1.971.447.75 1.468-1.053.886-5.712.901-10.355.032-7.141-1.34-8.745-.878-10.348 2.992-1.037 2.513-.958 5.712.191 7.116 1.141 1.396 2.426 1.532 2.849.311.422-1.228 4.372-3.119 8.775-4.204 7.053-1.739 8.657-1.205 13.388 4.412 3.255 3.861 4.603 7.036 3.414 8.034-1.164.981-.414 1.476 1.867 1.212 2.553-.287 3.144.152 1.764 1.301-1.133.957-1.197 2.792-.144 4.085 1.245 1.524 2.84 1.085 4.532-1.237 1.436-1.971 1.483-3.973.111-4.444-1.548-.534-1.252-1.021.79-1.3 2.601-.343 3.056.439 2.186 3.797-.606 2.33-.136 4.325 1.045 4.444 1.181.12 1.612 1.819.958 3.774-.878 2.633-.607 3.103 1.021 1.803 1.212-.973 2.353-.63 2.537.75.191 1.38 1.133 1.859 2.106 1.061.973-.79 1.013-2.393.088-3.55-1.261-1.58-.87-1.835 1.548-1.037 2.6.861 3.007.391 2.082-2.402-.63-1.915-1.891-2.872-2.792-2.13-.902.742-3.192-.87-5.083-3.582-1.898-2.705-4.651-5.338-6.127-5.84-1.468-.511-1.843-2.37-.837-4.149 1.276-2.242 2.154-2.266 2.872-.088 1.372 4.125 6.199 2.434 6.51-2.281.175-2.729-.646-3.774-3.167-4.021-2.027-.2-2.737-.894-1.748-1.708 3.08-2.521 8.92-.678 12.781 4.029 2.107 2.569 4.548 4.085 5.433 3.359.886-.726 3.694-.455 6.239.598 3.718 1.54 4.995 4.005 6.519 12.59 2.058 11.528 3.805 12.27 12.374 5.258 6.015-4.931 14.089-1.421 21.78 9.47 3.566 5.058 7.101 8.696 7.851 8.082.749-.615-.128-6.798-1.947-13.739-1.827-6.941-2.433-13.339-1.348-14.225 1.452-1.189 1.954-.63 1.938 2.154-.016 2.067 1.037 3.917 2.33 4.109 1.292.199.973.582-.71.862-2.154.359-1.915 1.906.79 5.177 2.64 3.184 3.733 3.591 3.454 1.285-.335-2.761.144-3.072 2.569-1.683 4.747 2.704 7.141 9.789 3.702 10.93-1.683.558-3.255-.272-3.486-1.835-.232-1.564-.846-.774-1.365 1.755-.518 2.529-.119 5.608.894 6.845 1.069 1.316.463 2.705-1.452 3.335-2.122.702-2.473 2.09-.982 3.909 3.08 3.766 5.649-.662 4.181-7.22-1.029-4.587-.75-5.002 2.226-3.311 3.191 1.819 3.447 1.612 4.204-3.454.495-3.295-.861-7.173-3.494-9.973-2.37-2.513-3.662-5.705-2.872-7.093.933-1.635 1.843-1.276 2.609 1.021.774 2.354 1.492 2.601 2.13.742 1.468-4.268 4.22 5.418 5.513 19.427.614 6.542 1.348 12.199 1.643 12.558.295.359 2.585-1.061 5.074-3.167 5.785-4.875 11.369-.415 10.324 8.257-1.268 10.475-1.348 11.959-1.021 19.554.359 8.441-2.705 11.896-10.22 11.521-4.787-.24-5.329-.822-6.702-7.308-2.345-11.05-5.584-11.401-16.746-1.803-9.526 8.193-35.12 18.828-37.705 15.669-.582-.702-2.178-.359-3.558.766-1.372 1.133-3.327 1.045-4.34-.192-1.005-1.236-4.364-2.369-7.452-2.521-3.087-.151-6.039-1.564-6.558-3.143-.518-1.572-2.154-2.697-3.63-2.497-1.476.191-1.954 1.252-1.053 2.345.894 1.093-1.436 1.317-5.186.479-5.265-1.165-7.188-2.689-8.449-6.694-1.603-5.09 1.078-3.917 4.787 2.098 1.141 1.859 1.811 1.772 2.019-.263.439-4.204-8.473-11.177-11.305-8.856-2.306 1.883-1.404 4.396 3.087 8.617 4.444 4.172-5.513 1.444-17.855-4.891-6.326-3.247-16.251-7.411-22.051-9.254-11.617-3.694-16.108-7.037-8.425-6.271 2.704.263 4.962-.415 5.034-1.516.064-1.101-1.101-1.572-2.585-1.045-1.476.534-3.63-.176-4.771-1.58-1.324-1.611-2.736-1.404-3.861.575-1.022 1.787-1.915 2.05-2.107.63-.183-1.364-1.125-1.835-2.098-1.037-.973.797-3.446-.631-5.497-3.168-3.016-3.718-3-4.404.096-3.558 2.928.798 2.649.056-1.197-3.199-4.587-3.878-4.595-4.061-.119-2.059 2.696 1.205 6.661 1.492 8.807.639 2.154-.854 4.484-.854 5.186 0 .694.861 2.146.837 3.215-.04 1.069-.87.918-1.692-.335-1.811-1.26-.12-.127-3.455 2.513-7.42l4.803-7.204-9.486 7.555c-8.887 7.077-9.925 7.364-16.203 4.452l-6.71-3.104 2.585 5.489c2.96 6.287.247 6.487-8.999.663-4.133-2.609-6.734-5.569-7.269-8.258-.55-2.776-2.01-4.316-4.324-4.547-2.648-.264-2.808-.918-.662-2.665 1.556-1.285 3.758-1.197 4.883.175 1.125 1.381 2.8 1.891 3.718 1.141 2.632-2.154-2.155-6.598-5.809-5.393-1.803.598-4.18 0-5.273-1.332-1.085-1.333-2.354-1.341-2.808-.024-.447 1.316-1.508 1.556-2.346.534-.846-1.029-1.939-.678-2.441.782-.655 1.899-.032 2.537 2.162 2.25 2.05-.279 3.311.918 3.781 3.59.559 3.128-1.276 2.537-8.353-2.657-7.116-5.233-9.063-7.547-9.039-10.762.024-3.279-.678-3.861-3.51-2.92-4.165 1.38-7.763-2.178-5.625-5.569 1.157-1.827.311-2.92-3.758-4.819l-5.249-2.449 3.199 4.348c2.92 3.973 2.84 4.157-.886 2.114-8.289-4.547-15.876-11.472-12.972-11.855 1.524-.208 4.204 1.213 5.944 3.143 2.393 2.665 2.489 1.811.383-3.51-2.21-5.593-3.503-6.925-6.351-6.55-2.138.279-3.263 1.3-2.8 2.545.941 2.553-3.287 3.359-5.218.997-.838-1.021.957-2.896 4.508-4.699 6.741-3.431 5.991-6.016-1.604-5.553-2.84.176-5.274-.526-5.417-1.564-.136-1.029-1.396-1.723-2.801-1.539-1.444.191-1.204 2.034.551 4.236 2.824 3.542 2.72 3.75-1.133 2.314-3-1.125-5.601-4.404-8.904-11.234-3.717-7.69-5.736-10.036-9.932-11.568-4.165-1.516-4.963-2.441-3.798-4.388.806-1.348.87-3.191.136-4.085-.734-.901-1.708-.55-2.162.766-1.437 4.197-2.873.16-2.402-6.773l.455-6.678-5.497 2.585c-3.734 1.763-5.361 3.726-5.074 6.103.343 2.793-.064 2.92-1.987.615-2.13-2.561.511-6.949 6.183-10.268 2.107-1.237-2.13-5.697-5.034-5.306-1.388.184-1.787 1.221-.901 2.306 1.204 1.476.646 1.963-2.202 1.947-2.091-.016-4.931-2.091-6.303-4.62-1.372-2.529-4.731-5.521-7.46-6.654-5.864-2.433-6.143-4.834-.766-6.613 3.048-1.006 3.638-.599 2.761 1.93-.83 2.426-.032 3.606 3.263 4.843 4.723 1.771 4.715 1.755-2.497-8.313-1.101-1.54-1.995-4.771-1.987-7.189.016-2.959-.846-4.284-2.617-4.052-1.452.199-2.042 1.077-1.316 1.962 2.106 2.569-6.797 5.689-10.316 3.614-1.755-1.037-4.452-1.771-5.983-1.643-1.684.143-1.644-.718.103-2.17a3.917 3.917 0 0 1 5.425.391c1.58 1.771 2.186 1.755 1.628-.032-1.029-3.279-8.593-5.314-9.534-2.569-1.101 3.199-13.036-7.699-14.879-13.587zm7.755 6.893c2.944-2.409 3.67-6.957 1.332-8.289-4.292-2.449-7.882 1.715-4.763 5.521 1.5 1.835 3.048 3.079 3.431 2.768zm-20.744-35.981c2.027-1.66 3.479-.615 6.79 4.898 4.787 7.962 4.579 5.992-.543-5.162-2.234-4.858-3.789-6.781-4.3-5.297-.439 1.268-2.633 2.306-4.875 2.29-3.295-.024-3.654.494-1.867 2.68 1.221 1.484 3.375 1.755 4.795.591zm18.446 14.169c.447-1.317.08-3.279-.83-4.364-.997-1.181-1.484-.439-1.221 1.859.551 4.906 1.022 5.481 2.051 2.505zM86.39 287.99c-.502-1.604-1.739-2.992-2.744-3.096-1.013-.095-.599 1.213.917 2.912 1.668 1.875 2.386 1.947 1.827.184zm-15.82-23.807c.917-.75.75-2.497-.375-3.869-1.133-1.381-2.801-1.891-3.718-1.141-.918.758-.75 2.497.375 3.869 1.133 1.38 2.8 1.891 3.718 1.141zm-7.963-12.996c2.258-1.843-2.401-9.75-6.829-11.585-3.191-1.324-3.558-2.202-1.588-3.821 1.636-1.333 1.301-3.638-.933-6.367-2.018-2.465-3.853-3.239-4.332-1.827-.463 1.34.048 2.737 1.141 3.112 1.085.375 1.34 1.811.558 3.183-1.563 2.736 9.781 19.116 11.983 17.305zm35.591 43.337c.917-.758.75-2.497-.375-3.87-1.133-1.38-2.8-1.89-3.718-1.14-.917.75-.75 2.497.375 3.869 1.133 1.38 2.8 1.891 3.718 1.141zm-13.355-19.722a2.172 2.172 0 0 0 .303-3.04 2.172 2.172 0 0 0-3.04-.303 2.171 2.171 0 0 0-.303 3.04 2.171 2.171 0 0 0 3.04.303zm38.486 46.752c-.909-2.96-2.776-5.497-4.14-5.633-1.365-.135-.623 2.29 1.659 5.386 3.901 5.297 4.053 5.313 2.481.247zm95.826 110.681c2.816.933 3.63.359 4.284-3 .718-3.686.223-4.22-4.372-4.755-7.188-.83-7.116 5.361.088 7.755zM50.233 220.471c.974-1.7 1.117-3.16.319-3.239-.797-.08-1.843 1.005-2.321 2.417-1.317 3.821-.016 4.364 2.002.822zm54.946 67.407c1.34-1.093 1.516-2.306.391-2.689-1.117-.39-2.378.304-2.801 1.532-1.077 3.136-.398 3.455 2.41 1.157zm109.564 127.69c.766-1.396-.479-1.005-2.776.87-2.298 1.883-2.921 3.024-1.397 2.553 1.524-.479 3.407-2.018 4.173-3.423zm27.333 37.865c5.082-2.338 3.128-8.641-2.728-8.792-2.402-.064-2.881.167-1.062.526 5.154 1.006 5.697 2.928 1.476 5.218-4.962 2.681-2.88 5.425 2.314 3.048zM123.951 306.882c.359-.295-.263-1.659-1.388-3.04-1.133-1.372-2.784-1.906-3.67-1.18-.885.726-.263 2.098 1.396 3.039 1.652.95 3.303 1.476 3.662 1.181zm82.335 102.615a2.16 2.16 0 0 0 .303-3.032 2.17 2.17 0 0 0-3.039-.303 2.161 2.161 0 0 0-.296 3.04 2.153 2.153 0 0 0 3.032.295zm-38.79-61.416c2.928-2.393 2.825-2.712-.829-2.513-2.298.128-4.915-.67-5.817-1.771-.901-1.101-1.978-1.021-2.385.168-1.316 3.829 5.561 6.956 9.031 4.116zM57.749 212.604c.965 2.92 1.252 2.769 2.002-1.085.495-2.569-.088-4.125-1.364-3.638-1.237.471-2.721-.59-3.303-2.345-.822-2.49-.183-3.2 2.88-3.184 3.167.024 3.295-.343.646-1.851-4.084-2.329-4.252-2.186-6.781 5.848-1.723 5.489-1.508 6.255 1.364 4.699 2.194-1.188 3.83-.63 4.556 1.556zm70.2 91.007a2.161 2.161 0 0 0 .303-3.032 2.172 2.172 0 0 0-3.04-.303 2.161 2.161 0 0 0-.303 3.032 2.164 2.164 0 0 0 3.04.303zm54.275 62.828c.431-2.872 2.744-6.414 5.13-7.866 3.446-2.091 4.93-1.676 7.18 2.018 1.556 2.553 2.952 3.526 3.104 2.17.335-3.103-13.858-21.246-15.542-19.866-.678.559-2.688.008-4.467-1.212-1.788-1.229-.854.455 2.066 3.726 2.92 3.279 5.21 6.941 5.09 8.145-.12 1.205-2.88-1.069-6.143-5.042-3.255-3.981-6-6.39-6.104-5.353-.103 1.029 2.434 5.122 5.641 9.087 3.199 3.965 4.244 5.991 2.306 4.515-4.356-3.35-9.239-2.927-8.752.75.207 1.516 2.473 5.322 5.042 8.457 4.42 5.402 4.707 5.425 5.449.471zm85.925 106.692c3.558.024 3.63-.67.446-4.548-3.175-3.885-3.869-3.957-4.547-.454-.439 2.265-.646 4.316-.455 4.547.192.239 2.242.439 4.556.455zM95.023 258.096c.407-.327.119-1.349-.631-2.266-.75-.918-2.162-1.021-3.135-.224-.973.798-.686 1.819.63 2.274 1.325.447 2.729.551 3.136.216zm22.027 20.95c.758-.598.296-1.452-1.029-1.907-1.316-.454-1.22-1.787.208-2.951 3.039-2.498 1.308-5.442-2.873-4.891-1.691.231-1.85.75-.39 1.253 1.412.486.949 2.967-1.054 5.672-2.8 3.766-2.776 4.707.104 4.348 2.011-.247 4.284-.933 5.034-1.524zm91.43 116.114c.455-1.316.247-3.103-.463-3.965-.702-.869-2.034-.957-2.952-.207-.917.75-.71 2.537.463 3.965 1.173 1.436 2.497 1.524 2.952.207zm45.858 57.228c2.665 1.524 3.256 1.228 2.928-1.468-.606-5.003-2.106-6.183-4.914-3.878-2.824 2.314-2.681 2.689 1.986 5.346zM130.007 286.945c6.159-2.904 11.584-.663 17.592 7.268 3.749 4.954 4.021 6.534 1.284 7.619-1.899.758-3.949 3.742-4.563 6.638-1.069 5.026-1.014 5.034 1.22.175 3.048-6.598 5.912-6.223 5.569.726-.239 4.843.12 5.346 3.112 4.348 1.859-.614 4.531.176 5.935 1.764 2.218 2.497 2.37 2.297 1.165-1.564-.774-2.489-2.824-4.747-4.643-5.138-4.612-.989-4.731-6.056-.192-8.138 4.468-2.05 4.245-2.625-1.787-4.667-5.265-1.787-8.265-8.776-4.005-9.343 1.811-.239 1.867-.749.152-1.34-1.524-.518-2.035-1.556-1.133-2.29.901-.742 2.369-5.217 3.255-9.948 1.237-6.598.758-8.768-2.042-9.311-2.011-.391-4.388.575-5.29 2.154-1.189 2.083-2.736 1.508-5.712-2.13-3.255-3.965-5.058-4.46-8.816-2.425-2.657 1.444-4.348 3.718-3.862 5.194.583 1.755 2.035 1.228 4.388-1.588 3.208-3.846 3.838-3.718 7.205 1.404 2.585 3.933 5.345 5.601 9.175 5.553 5.329-.072 5.337-.008.462 2.313-3.382 1.612-3.877 2.298-1.524 2.107 2.913-.224 3.24.175 1.963 2.401-2.05 3.606-5.058 5.369-5.8 3.407-.335-.878-1.572-.846-2.744.064-3.224 2.497-15.143 1.867-15.502-.83-.247-1.827-3.327.399-5.521 3.981-.144.239 1.109 1.205 2.768 2.154 1.668.95 5.218.694 7.891-.558zm-25.235-34.657c.574-2.92.08-3.575-2.457-3.24-1.748.24-3.503 2.075-3.894 4.085-.566 2.928-.071 3.582 2.466 3.239 1.747-.231 3.494-2.066 3.885-4.084zm185.077 233.736c1.38-1.125 1.907-2.777 1.181-3.67-.726-.886-2.098-.256-3.04 1.396-.941 1.659-1.476 3.303-1.18 3.67.295.359 1.667-.271 3.039-1.396zM180.461 337.997c2.337.526 4.316.279 4.396-.551.343-3.414-12.414-3.135-14.337.312-1.771 3.167-1.588 3.31 1.859 1.404 2.114-1.173 5.744-1.692 8.082-1.165zm36.221 58.113c-.479-1.524-2.019-3.399-3.415-4.173-1.404-.766-1.013.487.862 2.777 1.882 2.297 3.031 2.92 2.553 1.396zm-8.058-23.137c1.651 3.511 2.983 4.3 4.771 2.832 1.523-1.244 2.904-.758 3.574 1.253 1.372 4.157 3.223 2.744 3.781-2.896.567-5.641-1.364-7.835-5.64-6.415-4.276 1.413-9.087-5.927-6.375-9.725 1.732-2.417 1.835-2.298.918 1.125-.878 3.279-.503 3.782 2.561 3.431 4.563-.519 7.236-5.083 4.755-8.114-1.093-1.341-.263-3.574 1.962-5.266 2.123-1.619 3.232-1.795 2.466-.399-.774 1.404-.224 3.989 1.22 5.753 1.46 1.787 1.468 4.14.016 5.329-1.428 1.173-1.571 2.481-.311 2.92 1.261.431 3.088-.598 4.045-2.29 1.053-1.835 3.925-2.465 7.156-1.556 2.976.838 6.295.774 7.38-.135 1.301-1.101.782-1.516-1.524-1.237-1.922.24-3.662-.829-3.869-2.361-.199-1.54-1.364-2.003-2.577-1.037-1.739 1.396-1.971 1.069-1.101-1.556.886-2.681.216-3.175-3.502-2.577-4.205.678-4.356.526-1.732-1.699 1.588-1.341 2.625-2.753 2.306-3.136-.311-.391-1.141-2.425-1.835-4.531-.718-2.163-1.603-2.857-2.034-1.588-.423 1.228-3.335 2.736-6.463 3.359-3.67.718-5.361.151-4.763-1.604.519-1.492 1.588-1.923 2.386-.949.798.965 3.087.319 5.09-1.444 2.362-2.075 2.505-2.793.415-2.051-1.779.638-4.963.79-7.061.343-3.095-.662-4.356.248-6.558 4.731-2.018 4.109-1.835 5.721.718 6.215 2.394.471 3.183 1.444 2.585 3.208-.479 1.388-2.409 1.651-4.292.574-3.167-1.803-3.399-1.588-3.152 2.936.152 2.689-.271 4.228-.933 3.415-.67-.806-1.117.893-1.005 3.773.111 2.888-.359 4.612-1.045 3.838-.686-.782-1.652.638-2.146 3.151-.83 4.173-.543 4.348 3.31 2.035 3.431-2.059 4.636-1.62 6.503 2.345zm-37.569-40.545a2.161 2.161 0 0 0 .303-3.032 2.172 2.172 0 0 0-3.04-.303 2.161 2.161 0 0 0-.303 3.032 2.171 2.171 0 0 0 3.04.303zm129.708 149.128c.104-1.005-1.204-.599-2.904.917-1.875 1.668-1.946 2.394-.183 1.835 1.603-.51 2.992-1.747 3.087-2.752zM122.021 261.59c.215-2.178-.327-3.032-1.372-2.178-2.226 1.827-2.585 5.417-.559 5.617.862.087 1.731-1.46 1.931-3.439zm50.206 62.278c2.25-1.038 3.495-3.08 2.92-4.811-.614-1.859.503-3.519 2.904-4.332 3.375-1.149 3.303-1.452-.534-2.234-4.516-.926-8.8 3.462-6.327 6.486.75.917-.12 2.162-1.923 2.76-1.811.599-2.768 1.724-2.13 2.506.638.781 2.928.614 5.09-.375zm79.582 95.299c-.095 1.005-1.787 1.292-3.741.638-3.048-1.005-3.247-.782-1.365 1.556 1.205 1.508 4.085 2.752 6.399 2.768 3.446.016 3.805-.463 1.986-2.681-2.473-3.023-2.289-3.366 2.649-5.002 1.907-.63 4.324-.104 5.377 1.181 1.046 1.276 2.649 1.707 3.567.957 3.343-2.736-2.138-5.8-7.715-4.324-3.152.838-6.598.455-7.659-.846-2.035-2.481-7.97-1.515-8.25 1.349-.095.917 1.875 1.875 4.38 2.122 2.506.247 4.476 1.276 4.372 2.282zM83.478 217.383c.343-.287.583-2.681.527-5.313-.088-4.348-.2-4.356-1.149-.112-.989 4.452-.75 6.55.622 5.425zm34.059 38.104c.949-1.668 3.008-1.787 5.082-.279 1.915 1.396 4.229 1.914 5.146 1.164 1.045-.853-.271-2.289-3.542-3.845-4.875-2.314-12.215.989-9.518 4.284.678.822 1.946.224 2.832-1.324zm59.884 74.508c.918-.75 1.021-2.162.223-3.128-.797-.973-1.819-.694-2.265.631-.455 1.316-.559 2.728-.224 3.127.327.407 1.349.128 2.266-.63zM313.13 494.879c1.635-1.308 1.89-1.029 1.132 1.269-.734 2.226.918 3.622 6.67 5.648 4.205 1.476 8.465 2.019 9.462 1.205.99-.814-.335-1.699-2.96-1.963-6.167-.606-6.725-1.452-2.186-3.271 3.407-1.364 3.311-1.476-1.34-1.476-2.752-.007-7.819-2.497-11.249-5.528-5.058-4.468-5.984-4.7-4.851-1.205 2.035 6.271 2.968 7.204 5.322 5.321zM53.744 177.612c.359-.295.167-2.018-.431-3.822-.598-1.811-1.819-2.696-2.705-1.97-.893.726-.694 2.449.431 3.829 1.125 1.373 2.346 2.258 2.705 1.963zm11.704 8.202c.59-1.748 1.954-4.149 3.031-5.346 3.032-3.359 2.657-5.944-.494-3.367-3.024 2.474-6.726 11.569-4.787 11.76.646.064 1.659-1.308 2.25-3.047zm187.797 226.571c.878 1.077 2.354 1.341 3.272.583 2.066-1.692.654-3.463-4.006-5.011-2.321-.774-3.239-2.13-2.64-3.885 1.667-4.835-2.386-8.792-5.976-5.848-2.314 1.891-2.425 3.295-.359 4.468 1.915 1.093 2.019 2.529.295 3.941-2.481 2.026-2.266 2.282 2.553 3.008 2.896.431 5.984 1.667 6.861 2.744zM71.511 186.188c2.13-2.553 3.359-5.265 2.737-6.031-.631-.758-2.777 1.292-4.779 4.556-4.364 7.132-3.311 7.898 2.042 1.475zm32.056 46.8c.447-1.324.551-2.728.216-3.135-.327-.407-1.349-.12-2.266.63-.918.75-1.021 2.162-.223 3.136.797.973 1.819.686 2.273-.631zm203.292 248.664c1.228-.16 1.372-2.163.327-4.436-1.564-3.407-2.043-3.447-2.665-.24-.885 4.58-.638 5.074 2.338 4.676zM137.068 271.579c-.503-1.596-1.74-2.992-2.753-3.088-1.005-.104-.59 1.205.918 2.904 1.675 1.883 2.393 1.955 1.835.184zm45.459 50.342c-.862-4.859-6.175-7.324-5.545-2.561.232 1.747 1.732 3.925 3.335 4.835 2.449 1.404 2.8 1.045 2.21-2.274zm10.803 11.784c3.207-2.633.989-4.668-5.434-4.979-5.177-.255-5.225-.111-1.148 3.295 2.345 1.963 5.305 2.721 6.582 1.684zM56.44 168.246c.503-1.468 2.386-2.162 4.189-1.54 2.377.814 2.417.231.151-2.146-2.218-2.33-3.797-2.346-5.473-.032-1.3 1.779-1.779 3.949-1.069 4.811.702.861 1.7.375 2.202-1.093zm117.271 127.259c.335-3.391-4.827-2.186-8.249 1.931l-3.894 4.691 6.008-2.705c3.311-1.483 6.063-3.247 6.135-3.917zm-3.797 9.925c.454-2.306.191-4.26-.575-4.332-2.098-.208-3.343 4.731-1.691 6.749.909 1.109 1.763.192 2.266-2.417zm169.623 200.411c.718-4.818-4.021-5.592-6.598-1.085-1.532 2.697-1.117 3.527 2.059 4.149 3.127.606 4.092-.048 4.539-3.064zM111.896 223.702c.208-2.098-9.087-5.425-10.938-3.91-.909.742 1.157 2.226 4.58 3.303 3.423 1.078 6.287 1.349 6.358.607zm52.01 72.769c.918-.758 1.021-2.163.223-3.136-.797-.973-1.819-.686-2.273.63-.455 1.317-.551 2.729-.224 3.136.335.399 1.357.12 2.274-.63zM317.693 469.82c1.987.614 2.673-.247 2.37-2.96-.28-2.465-1.173-3.55-2.506-3.056-2.959 1.093-10.427-8.656-8.097-10.563 1.077-.877 1.324-1.659.55-1.739-2.481-.247-7.22 7.755-5.034 8.505 1.165.399 3.638 1.994 5.497 3.542 2.513 2.098 2.481 3.638-.12 6.008-3.247 2.96-3.207 3.055.519 1.292 2.21-1.045 5.281-1.508 6.821-1.029zM185.686 316.264c.455-1.324.559-2.728.224-3.135-.327-.407-1.356-.12-2.274.63-.917.75-1.013 2.162-.215 3.136.789.973 1.819.686 2.265-.631zm10.308 11.904c2.003.199 3.064.837 2.362 1.42-.71.582.758 1.26 3.263 1.508 5.13.51 8.792-1.668 6.829-4.061-.718-.87-2.784-1.372-4.603-1.109-4.181.598-10.771-3.167-8.617-4.931.886-.726 2.705-.016 4.029 1.58 2.051 2.449 2.346 2.322 1.955-.87-.335-2.744-1.763-3.518-5.234-2.832-2.625.519-4.675-.016-4.555-1.181.111-1.164-.607-1.452-1.596-.638-3.526 2.888.742 10.571 6.167 11.114zM302.191 455.77c1.548-.59 1.301-1.659-.654-2.776-1.747-.997-3.917-1.213-4.811-.479-2.194 1.795 2.29 4.468 5.465 3.255zm-162.73-206.179c3.662-3 4.356-4.875 2.585-6.997-1.931-2.322-2.33-2.194-1.987.63.24 1.947-1.045 4.029-2.864 4.628-2.896.965-4.531 3.654-3.199 5.281.247.303 2.713-1.292 5.465-3.542zM73.569 172.53c.918-.75.583-2.673-.742-4.268-2.066-2.474-2.353-2.346-1.986.925.542 4.819.694 5.01 2.728 3.343zm8.234 1.54c.917-.758-.056-1.173-2.162-.934-2.106.232-4.58 1.045-5.497 1.795-.918.75.056 1.173 2.162.934 2.106-.24 4.579-1.045 5.497-1.795zm213.966 264.539c.926 2.793 1.269 2.673 1.915-.654.638-3.263-.12-4.38-3.822-5.632-5.337-1.803-7.276-.83-5.872 2.96.543 1.468 2.258 2.058 3.822 1.3 1.643-.806 3.303.048 3.957 2.026zm-170.03-205.661c.893-.734.263-2.098-1.389-3.039-1.659-.95-3.303-1.476-3.67-1.181-.359.295.272 1.659 1.397 3.04 1.125 1.372 2.776 1.906 3.662 1.18zm-54.978-70.662c.455-1.316.551-2.729.223-3.135-.335-.399-1.356-.12-2.273.63-.918.758-1.014 2.162-.224 3.135.798.974 1.819.686 2.274-.63zm4.867-2.649c.447-2.306.111-4.26-.75-4.348-.862-.088-1.572-2.074-1.588-4.412-.016-3.438-.239-3.654-1.141-1.125-.614 1.724-.446 5.274.367 7.899 2.075 6.629 2.194 6.709 3.112 1.986zm240.613 292.232c.455-1.316.551-2.728.223-3.135-.335-.399-1.356-.12-2.273.63-.918.758-1.022 2.162-.224 3.135.798.974 1.819.694 2.274-.63zm26.862 30.74c1.748.997 4.444.766 6-.503 1.548-1.268 4.46-2.146 6.462-1.946 2.027.199 3.04-.383 2.282-1.309-.758-.917-3.008-1.835-5.01-2.034-2.625-.263-3.112-.798-1.739-1.923 1.045-.854 2.983-1.189 4.3-.734 1.316.455 3.997-.582 5.944-2.298 1.954-1.723 2.305-2.736.773-2.257-1.523.47-3.646-.2-4.707-1.5-1.069-1.301-3.374-1.189-5.138.255-1.763 1.444-4.771 3.143-6.693 3.782-2.561.845-2.625 1.651-.264 2.999 4.301 2.45 1.915 4.165-3.861 2.777-4.803-1.149-3.845 1.556 1.651 4.691zm-32.407-44.319a2.16 2.16 0 0 0 .303-3.031 2.168 2.168 0 0 0-3.039-.304 2.153 2.153 0 0 0-.296 3.032 2.16 2.16 0 0 0 3.032.303zm9.111 5.776c-.694-3.638-.415-7.323.631-8.177 1.037-.846 1.116-1.628.159-1.715-3.311-.336-5.122 9.948-2.33 13.227 2.378 2.785 2.617 2.274 1.54-3.335zm64.177 77.484c1.148-.151 1.22-1.34.159-2.632-1.061-1.301-2.234-1.46-2.617-.359-.375 1.101-.446 2.281-.159 2.632.287.351 1.46.511 2.617.359zm-39.014-53.98c2.984-3.263 1.835-7.092-2.92-9.749-2.864-1.604-3.143-.75-1.603 4.89a820.002 820.002 0 0 1 1.954 7.213c.048.207 1.205-.846 2.569-2.354zm-19.442-26.479c.949-1.66 1.476-3.303 1.18-3.67-.295-.359-1.659.271-3.039 1.396-1.373 1.125-1.907 2.776-1.181 3.67.734.885 2.098.255 3.04-1.396zm11.823 9.326c.774.949-.119 2.234-1.994 2.856-2.067.686-2.41 1.468-.87 1.995 1.396.478 3.223-.335 4.061-1.803.846-1.476 2.625-2.083 3.973-1.349 1.34.726 1.181-.335-.359-2.361-2.689-3.534-7.755-3.359-11.52.407-.99.981-.2 1.053 1.755.159 1.946-.893 4.18-.853 4.954.096zm48.396 63.363c4.348-.096 4.356-.2.111-1.149-4.451-.99-6.55-.758-5.425.622.287.343 2.673.582 5.314.527zm-77.301-93.959c.232-2.298 8.01-1.723 10.037.75.806.981 2.218 1.173 3.135.415 2.17-1.779.295-3.934-6.199-7.133-5.672-2.792-12.533 1.285-9.143 5.425 1.093 1.333 2.067 1.58 2.17.543zm68.732 72.745c.638-.519 1.317-2.585 1.516-4.588.287-2.832.798-3.111 2.33-1.244 1.188 1.452 2.17-1.038 2.505-6.375.59-9.542-5.162-17.64-8.449-11.887-1.149 2.01-1.923 2.122-2.162.295-.208-1.564-2.617-3.606-5.353-4.54-4.149-1.42-4.771-2.305-3.774-5.345 1.021-3.104.766-3.287-1.755-1.261-2.601 2.091-1.907 3.383 5.88 10.907 6.199 5.975 8.018 8.632 6.103 8.887-1.5.208-2.577 1.516-2.386 2.92.184 1.404 1.468 1.636 2.841.503 1.38-1.125 2.353-3.176 2.17-4.556-.184-1.388.375-3.103 1.252-3.813 1.317-1.085 2.146 1.308 3.686 10.611.088.534-1.747.957-4.077.941-5.433-.04-8.648 5.409-4.571 7.731 1.699.965 3.606 1.332 4.244.814zm-44.454-58.376c2.401-1.963-.662-4.293-4.125-3.144-2.13.702-2.218 1.604-.271 2.705 1.596.917 3.574 1.109 4.396.439zm21.158 27.053c1.659-1.483 1.683-2.17.056-1.659-2.011.622-3.008-.399-3.67-3.75-.862-4.372-3.574-4.515-4.005-.207-.423 4.22 4.851 8.106 7.619 5.616zm21.772 1.907c.918-.75 1.014-2.162.216-3.127-.79-.974-1.811-.694-2.266.63-.455 1.316-.559 2.729-.223 3.127.335.407 1.356.128 2.273-.63zm43.569 45.675c.215-2.178-.319-3.04-1.364-2.186-2.226 1.827-2.585 5.417-.559 5.617.862.088 1.732-1.46 1.923-3.431zm-34.234-43.361c1.053-1.843 2.896-3.032 4.109-2.641 4.013 1.293 11.783-2.904 9.813-5.305-1.875-2.29-16.93 2.664-18.055 5.943-1.244 3.614 2.25 5.314 4.133 2.003zm7.619 4.723c2.33-.926 4.372-.63 4.54.654.175 1.277 1.483 1.372 2.912.2 4.539-3.71-.966-6.909-7.659-4.46-3.543 1.3-5.896 3.016-5.234 3.829.662.806 3.111.71 5.441-.223zm35.67 32.559c.766-1.404-.478-1.013-2.776.861-2.29 1.883-2.92 3.032-1.396 2.553 1.524-.478 3.406-2.018 4.172-3.414zm10.436-7.611c.981-.798-.048-1.724-2.426-2.186-2.273-.439-4.388-.591-4.707-.327-.319.255.774 1.244 2.434 2.186 1.651.941 3.773 1.093 4.699.327zm11.097 17.512c4.173-.559 3.303-2.41-1.26-2.673-2.258-.136-3.495.495-2.761 1.396.742.902 2.545 1.476 4.021 1.277zm-39.484-51.404c.447-1.316.551-2.728.216-3.135-.327-.407-1.348-.12-2.266.63-.917.75-1.021 2.162-.223 3.136.797.973 1.819.686 2.273-.631zm21.948 26.432c.503-1.468 2.394-2.162 4.205-1.54 2.585.894 3.295.391 3.351-2.361.032-1.923-.136-2.777-.375-1.899-.24.886-2.434 1.404-4.875 1.157-4.532-.447-7.045 2.641-4.587 5.64.75.918 1.779.471 2.281-.997zm25.084 22.858c.359-.296.143-2.067-.471-3.934-.646-1.954-1.476-2.393-1.947-1.037-.782 2.282 1.061 6.079 2.418 4.971zm-6.399-19.938c2.266.75 3.542 2.505 3.527 4.843-.04 6.43 2.018 3.789 2.951-3.774.742-6.055.503-6.63-1.38-3.375-2.002 3.463-2.266 3.375-2.282-.75-.008-2.561.99-4.794 2.21-4.954 1.229-.168 1.58-1.093.782-2.066-1.771-2.162-3.526-.822-5.09 3.901-.782 2.354-2.178 3.247-4.093 2.609-1.595-.527-2.289-.208-1.539.71.75.925 2.968 2.202 4.914 2.856zM121.981 351.703c1.955 1.46 4.867 2.513 6.462 2.33 2.122-.231 2.378.112.95 1.316-1.069.894-1.205 3.224-.312 5.178.894 1.947-1.14.16-4.523-3.965-3.383-4.133-4.54-6.319-2.577-4.859zm17.536 18.454c1.005.096 2.25 1.492 2.752 3.087.559 1.772-.167 1.7-1.835-.183-1.516-1.699-1.922-3.008-.917-2.904zm21.812 19.658c1.38.75 3.255 2.984 4.165 4.954.901 1.971-.224 1.349-2.513-1.372-2.29-2.728-3.032-4.34-1.652-3.582zm-2.952-7.986c.974-.798 2.386-.694 3.136.223.75.918 1.037 1.939.63 2.274-.407.327-1.819.231-3.136-.223-1.316-.455-1.603-1.476-.63-2.274zm87.321-1.811c1.053-.862.415-2.513-1.436-3.702-2.784-1.803-2.705-1.979.471-1.101 3.973 1.101 5.002 6.941 1.149 6.558-1.141-.112-1.221-.909-.184-1.755zm9.438.63c.918-.75.75-2.489-.383-3.869-1.125-1.373-1.3-3.112-.375-3.87.918-.75.742-2.489-.383-3.869-2.377-2.904 1.157-6.383 7.819-7.691 5.122-1.013 8.361 1.867 9.693 8.616.742 3.774.016 4.652-4.89 5.92-3.167.814-6.766.423-7.994-.877-1.229-1.293-1.245-.12-.048 2.616 2.505 5.713.295 10.994-2.944 7.037-1.189-1.452-1.412-3.255-.495-4.013zM135.065 211.695c.096-6.909-.742-8.92-4.34-10.412-5.609-2.329-6.462-3.367-4.236-5.186.973-.797 1.906-.391 2.074.894.175 1.284 1.332 2.202 2.585 2.034 1.244-.159 1.436-2.114.415-4.34-1.237-2.688-.686-4.42 1.635-5.194 1.923-.63 4.021-.502 4.667.288.655.79 1.955.079 2.896-1.572.95-1.659 2.402-2.178 3.232-1.165.829 1.013.383 2.769-.99 3.893-1.38 1.133-1.851 2.849-1.061 3.822.798.973.319 1.915-1.061 2.098-4.172.559-1.173 2.418 6.478 4.013 6.75 1.404 6.957 1.317 3.216-1.5-2.194-1.643-3.399-3.486-2.665-4.092 2.146-1.748 5.672 1.444 11.289 10.236 4.691 7.339 4.755 8.137.614 7.571-4.196-.575-4.611-.04-4.499 5.816.127 6.215-2.809 11.776-3.495 6.63-.191-1.38-1.803-1.309-3.598.159-6.406 5.242-13.316-2.106-13.156-13.993zm4.085-9.239c-1.452-2.649-2.226-6.024-1.715-7.5.502-1.483-.144-2.8-1.437-2.927-3.39-.336-2.058 6.534 2.179 11.225l3.614 4.005-2.641-4.803zm17.273 33.939c.039-8.369 1.898-9.582 2.728-1.771.614 5.728.997 6.143 5.122 5.481 2.457-.399 3.686-.048 2.737.774-.95.829-3.726 1.571-6.176 1.659-4.1.144-4.443-.335-4.411-6.143zm18.732 14.289c2.976-10.132 2.043-15.183-2.21-12.007-1.635 1.22-2.489 1.284-1.883.143.599-1.133 1.867-2.393 2.817-2.784.957-.399 1.308-3.51.798-6.925-.527-3.518-.248-4.5.654-2.274.869 2.17 3.494 4.332 5.832 4.811 3.59.734 3.662 1.069.502 2.146-5.034 1.707-4.212 5.521 1.716 7.978 2.664 1.109 3.726 2.162 2.361 2.338-3.965.534 2.402 10.108 7.021 10.571 2.29.223 4.755 1.141 5.481 2.026 1.875 2.29-1.588 7.651-4.332 6.71-1.261-.431-3.016-.199-3.901.527-.886.726 1.22 2.21 4.683 3.295 3.462 1.093 6.247 1.005 6.183-.184-.168-3.343 4.755-8.138 6.358-6.183.782.957.016 2.896-1.707 4.308s-3.151 4.452-3.167 6.766c-.016 3.446.463 3.805 2.68 1.986 3.87-3.167 6.766 1.436 4.843 7.691-.941 3.056-.104 7.54 1.971 10.571 1.978 2.896 3.191 4.029 2.696 2.513-.502-1.523.128-2.896 1.389-3.071 1.26-.168 1.547-1.333.63-2.585-.926-1.253.199-1.309 2.489-.112 3.566 1.843 3.838 1.723 1.899-.853-1.253-1.66-1.58-3.591-.726-4.293.854-.694.526-3.247-.734-5.664-1.269-2.418.359-.926 3.606 3.319 5.266 6.893 5.465 7.978 1.827 10.204-3.08 1.883-3.351 3.239-1.109 5.592 1.628 1.708 3.247 2.25 3.606 1.205s2.777.511 5.377 3.463l4.716 5.361-2.968-5.936-2.96-5.936 5.114 4.165c2.816 2.298 4.755 5.202 4.324 6.47-.487 1.42 1.468 3.415 5.098 5.202 5.066 2.489 5.728 3.503 4.755 7.276-.63 2.41-.415 4.46.463 4.548.877.088.805 1.548-.168 3.255-2.258 3.957-4.316 1.524-3.271-3.854 1.189-6.111-4.946-12.677-8.848-9.486-1.739 1.42-5.896 2.601-9.254 2.617-5.106.032-6.734-1.133-10.005-7.108-2.154-3.934-2.984-7.276-1.843-7.428 1.133-.144 1.907-1.42 1.723-2.824-.191-1.404-1.332-1.747-2.545-.75-1.204.989-4.483 1.021-7.268.08-4.42-1.492-4.97-2.506-4.252-7.779 1.029-7.611-.088-8.936-9.574-11.337-6.789-1.723-7.787-2.625-8.84-7.938-.646-3.295-.151-7.58 1.109-9.51 1.261-1.931 1.269-3.87.024-4.293-1.244-.43-2.665.391-3.159 1.819-.535 1.556-1.045 1.437-1.277-.295-.215-1.595-1.156-2.274-2.106-1.5-.941.774-2.202-.087-2.808-1.906-.798-2.418-1.62-2.402-3.032.079-1.197 2.099-.662 4.325 1.42 5.84 1.851 1.341 2.338 2.577 1.085 2.745-4.555.606-5.816-4.26-3.303-12.805zm4.364-3.231c1.03-2.489 1.564-4.899 1.189-5.354-.375-.462-1.524 1.197-2.553 3.678-1.037 2.49-1.572 4.899-1.197 5.354.375.462 1.532-1.197 2.561-3.678zm15.733 12.198c.974-.789.686-1.819-.63-2.265-1.324-.455-2.729-.559-3.135-.224-.407.327-.12 1.348.63 2.266.75.925 2.162 1.021 3.135.223zm-90.289-87.735c.399-.336 1.811-.232 3.128.223 1.324.447 1.604 1.468.63 2.266-.965.798-2.377.694-3.127-.224-.758-.917-1.037-1.938-.631-2.265zm175.305 208.413c3.454-3.295 5.967-1.348 3.606 2.8-.894 1.564-2.737 2.202-4.093 1.428-1.38-.781-1.165-2.656.487-4.228zM163.842 233.427c.934-1.651.79-3.311-.327-3.702-2.968-1.013-7.14-10.714-5.273-12.238.869-.718 1.731-.184 1.914 1.189.2 1.476 1.133 1.077 2.306-.982 1.54-2.696 2.258-2.617 3.247.383.702 2.122 1.979 4.739 2.848 5.824 1.014 1.277.423 1.588-1.691.894-2.433-.806-2.673.159-.957 3.797 1.26 2.689 1.156 5.824-.24 6.973-3.231 2.641-4.029 1.716-1.827-2.138zm85.031 101.985c-.239-1.787.615-4.388 1.883-5.784 1.755-1.931 2.864-1.372 4.604 2.313 2.664 5.657 6.534 3.966 4.22-1.85-2.074-5.21 5.361-10.388 9.39-6.527 1.652 1.58 1.811 2.29.351 1.564-3.717-1.843-7.802 2.043-5.329 5.066a3.255 3.255 0 0 0 4.556.455c1.499-1.229 3.709-.527 5.52 1.747 3 3.782 2.992 3.798-2.64 2.856-3.104-.518-6.718-.383-8.018.296-3.926 2.058 1.22 6.151 5.56 4.427 2.21-.877 6.878-.694 10.372.399 3.494 1.101 5.226 2.154 3.846 2.338-2.689.359-1.397 6.877 1.571 7.898.982.335.758 1.452-.494 2.474-1.46 1.196-3.024.375-4.325-2.266-4.1-8.313-5.481-9.414-10.467-8.337-11.504 2.489-19.698-.32-20.6-7.069zm4.428 2.146c.918-.75 1.014-2.162.216-3.135-.79-.974-1.811-.686-2.266.63-.455 1.316-.559 2.728-.223 3.135.335.407 1.356.12 2.273-.63zm7.835 3.415c.088-.934-1.524-1.859-3.59-2.059-2.992-.287-3.024.064-.176 1.7 1.979 1.133 3.67 1.292 3.766.359zm36.269 53.852c.454-1.324 1.476-1.603 2.265-.63.798.965.702 2.378-.215 3.127-.918.758-1.947 1.038-2.274.631-.335-.399-.231-1.811.224-3.128zm-5.489-10.315c1.531-.591 3.925-.352 5.313.526 1.444.91 1.324 2.05-.263 2.657-1.54.582-3.925.343-5.314-.535-1.444-.909-1.332-2.042.264-2.648zm-80.324-103.014c.941-1.652 2.265-2.314 2.951-1.484 1.851 2.265.04 6.095-2.473 5.233-1.204-.415-1.42-2.098-.478-3.749zm-.503-12.51c-.351-3.08.191-3.08 2.744 0 1.78 2.138 2.075 3.981.671 4.172-3.024.399-2.881.575-3.415-4.172zm73.965 88.31c4.061-2.433 5.936-1.46 5.13 2.681-.59 3.055-1.468 3.335-4.204 1.348-2.226-1.62-2.553-3.048-.926-4.029zm48.292 57.594c3.75-2.505 5.385-2.098 9.757 2.442 3.67 3.821 4.205 5.138 1.756 4.388-1.923-.591-3.926-2.386-4.46-3.997-.551-1.668-3.239-2.258-6.263-1.365l-5.289 1.548 4.499-3.016zm2.761 6.774c.454-1.317 1.476-1.604 2.273-.63.79.973.695 2.385-.223 3.135-.917.75-1.939 1.037-2.274.63-.327-.407-.231-1.811.224-3.135zM186.508 236.906c1.005.103 2.242 1.492 2.753 3.087.55 1.771-.168 1.7-1.835-.175-1.516-1.7-1.931-3.008-.918-2.912zm108.152 130.81c1.452.494 3.471-.567 4.492-2.354 1.532-2.681 1.037-3.542-2.801-4.851-3.749-1.284-4.427-2.282-3.478-5.066.957-2.816.144-3.989-4.292-6.167-3.008-1.476-4.811-3.223-4.013-3.877 1.954-1.596 10.69 4.755 14.879 10.818 1.859 2.689 4.189 4.228 5.178 3.423.981-.806 2.481-.631 3.319.391.869 1.061-.272 2.696-2.641 3.781-3.343 1.532-3.423 2.059-.423 2.641 2.058.399 4.516-.63 5.465-2.282 1.356-2.377 2.569-1.731 5.8 3.08 3.495 5.202 3.455 6.741-.255 10.563-5.84 6.007-9.63 5.218-17.36-3.598-3.575-4.077-5.322-7.005-3.87-6.502zm22.028 4.34c.367-.296-.263-1.66-1.388-3.04-1.125-1.372-2.777-1.907-3.67-1.173-.886.726-.256 2.09 1.396 3.04 1.659.941 3.303 1.468 3.662 1.173zm24.214 53.405c1.005.104 2.241 1.492 2.752 3.096.558 1.763-.168 1.691-1.835-.184-1.516-1.699-1.923-3.007-.917-2.912zm-97.103-123.334c-1.053-3.678-.845-4.005 1.133-1.787 1.333 1.5 2.059 3.806 1.604 5.122-.95 2.76-.997 2.705-2.737-3.335zm11.952 11.122c-1.899-4.875-1.724-4.851 2.17.319 2.321 3.079 3.63 6.079 2.904 6.677-1.524 1.253-2.29.2-5.074-6.996zm21.748 19.825c-1.061-3.678-.846-4.013 1.133-1.787 1.332 1.5 2.05 3.806 1.604 5.122-.95 2.753-.998 2.697-2.737-3.335zm12.27 8.066c.894-.726 2.538-.199 3.67 1.181 1.125 1.38 1.756 2.745 1.389 3.04-.359.295-2.011-.232-3.662-1.181-1.66-.941-2.282-2.314-1.397-3.04zm40.075 43.952c-.83-6.055-2.346-9.805-3.902-9.598-1.555.208-2.217-1.332-1.699-3.989.455-2.377 1.715-4.236 2.784-4.125 1.078.104 1.078.91.008 1.788-1.077.877-1.3 2.385-.502 3.358.798.974 1.851.599 2.337-.829.495-1.428 1.556.51 2.354 4.3 1.372 6.47 1.675 6.749 4.946 4.46 2.801-1.963 2.681-2.984-.606-5.194-3.167-2.13-3.287-2.697-.51-2.497 5.273.391 8.217 9.071 3.598 10.619-2.841.949-2.833 1.292.048 1.587 2.888.303 3.877-.622 4.603-4.292.846-4.3 1.013-4.228 2.018.846.607 3.039 2.139 6.167 3.407 6.965 1.269.789 3.271 4.659 4.452 8.584 2.473 8.226 5.409 10.452 12.573 9.534 6.886-.886 7.58-4.228 2.003-9.63-3.806-3.678-3.941-4.475-.758-4.459 2.13.016 4.436.973 5.122 2.122.686 1.149 5.066 3.981 9.741 6.287 4.668 2.305 9.502 5.592 10.747 7.292 1.237 1.699 2.601 2.074 3.024.837.43-1.244 1.38-1.524 2.114-.622.734.894 2.936 2.617 4.898 3.822 3.184 1.954 3.008 2.058-1.667.997-4.3-.974-5.377-.447-6.039 2.968-1.189 6.135-6.04 2.513-5.035-3.766.726-4.516.256-5.074-7.651-9.063-7.292-3.678-7.986-3.67-5.162.04 3.99 5.249 5.043 11.831 1.827 11.512-1.292-.127-1.811-1.787-1.164-3.694.654-1.898.055-3.526-1.341-3.622-1.388-.096-2.098 1.045-1.563 2.521 1.675 4.691-1.963 5.37-5.513 1.03-1.883-2.29-4.141-3.575-5.035-2.849-2.808 2.306 12.383 10.563 21.047 11.449 2.976.303 6.071 1.356 6.877 2.338.806.981-4.516.614-11.824-.822-9.214-1.819-14.592-4.213-17.544-7.811-2.545-3.103-6.629-5.313-10.164-5.489-3.255-.159-6.318-1.516-6.813-3.008-.495-1.499-2.721-2.736-4.939-2.752-5.832-.032-9.557-5.792-11.097-17.145zm27.508 13.603c-.47-2.681-.59-5.88-.271-7.093.319-1.221-1.372-3.598-3.75-5.289-4.324-3.072-4.316-3.08 1.604-.966 6.04 2.154 10.18 5.234 6.542 4.875-1.101-.112-1.484 2.194-.853 5.114.797 3.726 1.978 5.25 3.917 5.098 1.675-.136 1.659.702-.024 2.106-3.838 3.207-6.167 1.955-7.165-3.845zm38.256 33.795c-1.827-5.034-1.221-6.311 5.545-11.544 5.241-4.053 8.185-5.162 9.494-3.566 1.563 1.914 1.132 2.305-2.514 2.281-3.885-.024-3.725.67 1.405 5.968 3.191 3.295 6.869 5.577 8.169 5.074 1.524-.59.71-2.33-2.29-4.883-2.56-2.178-3.661-3.901-2.449-3.821 1.205.072 5.609 3.782 9.773 8.241 6.574 7.045 7.021 8.106 3.375 8.082-3.359-.024-3.981-.654-3.167-3.199.822-2.537.255-3.088-2.824-2.768-5.577.59-7.197 2.449-3.806 4.38 1.62.925 2.593 2.712 2.154 3.973-.431 1.26-2.05.75-3.598-1.141s-3.391-2.992-4.101-2.45c-.702.543-3.941.998-7.188 1.014-4.843.024-6.295-.998-7.978-5.641zm-10.795-22.833c.455-1.317 1.436-1.644 2.186-.726.758.917.998 2.744.543 4.069-.447 1.316-1.436 1.643-2.186.726-.75-.918-.997-2.745-.543-4.069z',
									fill: '#bb5326',
								}),
								yt.createElement('path', {
									d: 'M108.083 333.816a2.161 2.161 0 0 1 3.032.303c.75.918 2.202.982 3.231.144 1.077-.885.111-2.984-2.298-5.002-2.29-1.915-3.327-3.59-2.298-3.726 3.16-.423 2.115-8.146-1.875-13.77-4.116-5.8-5.6-5.769-6.207.127-.319 3.048-.646 3.176-1.651.655-.686-1.74-2.465-5.537-3.949-8.457-2.521-4.939-2.122-5.745 5.888-12.007 8.01-6.263 8.919-6.447 13.403-2.769 2.641 2.17 5.744 3.367 6.893 2.665 1.149-.71 2.96-1.859 4.021-2.553 5.018-3.287 15.893-2.489 19.076 1.396 1.859 2.274 2.585 4.787 1.619 5.585-.973.79-.662 1.827.687 2.289 1.348.463 1.723 1.205.821 1.652-1.914.957-8.903 10.651-8.249 11.449 2.896 3.542 10.946 5.84 12.278 3.518 3.168-5.561 15.981 8.313 14.816 16.052-.894 5.968-11.05 10.244-14.449 6.095-1.188-1.452-2.497-1.659-2.912-.454-.821 2.377 6.463 9.733 15.079 15.222 3.957 2.521 5.832 5.321 6.877 10.26.798 3.742 2.019 7.507 2.729 8.369 2.265 2.76 8.728-.678 8.082-4.3-.375-2.091 1.268-4.436 4.228-6.048 3.814-2.066 5.537-1.643 8.17 2.003 1.835 2.537 3.39 6.111 3.47 7.938.184 4.452 22.092 11.417 22.514 7.164.375-3.741 6.319-5.832 10.236-3.598 2.003 1.149 1.811 3.582-.598 7.516-3.175 5.193-1.915 12.286 1.668 9.358.773-.63 3.654-.04 6.406 1.316 3.981 1.963 4.867 3.455 4.348 7.316-1.979 14.6-1.308 19.85 2.88 22.634 6.263 4.157 15.119 4.221 18.877.136 2.728-2.96 2.433-4.492-1.756-9.119-2.768-3.064-6.055-5.178-7.308-4.699-1.5.566-2.561-.575-3.103-3.343-1.341-6.789 8.8-11.369 19.53-8.824 10.532 2.505 13.045 7.005 6.766 12.143-3.814 3.119-3.838 3.997-.184 6.422 10.986 7.261 11.888 8.505 9.167 12.678-1.787 2.744-4.603 4.021-8.457 3.829-4.962-.247-5.72.24-5.329 3.415.662 5.361 6.486 11.648 13.156 14.201 3.191 1.221 8.09 4.962 10.89 8.321 4.859 5.808 4.835 6.295-.439 10.404-3.039 2.369-6.582 3.973-7.866 3.566-1.285-.407-4.213.614-6.51 2.266-5.09 3.67-8.744.606-22.531-18.901-4.826-6.837-7.667-9.254-10.85-9.238-3.415.024-3.694.247-1.348 1.085 1.627.582 2.17 1.715 1.197 2.505-2.21 1.811-3.072.782-4.221-5.026-.694-3.519-1.253-3.973-2.417-1.939-1.931 3.391-15.749 1.667-17.002-2.106-.518-1.572-1.404-3.231-1.97-3.694-.567-.463-.272-4.891.654-9.845.925-4.955.965-9.885.088-10.954-2.003-2.449-12.47-1.38-14.832 1.508-.965 1.188-2.074 1.412-2.449.502-.383-.909-3.606-2.537-7.157-3.622-3.845-1.165-8.488-4.699-11.472-8.72-2.761-3.718-7.683-8.185-10.938-9.933-4.54-2.433-7.356-5.84-12.007-14.512-5.178-9.669-6.949-11.616-12.031-13.212-5.928-1.867-19.459-17.161-15.653-17.703 1.029-.152 1.268-1.006.534-1.899-.734-.894-1.843-3.175-2.473-5.066-.766-2.322-2.88-2.856-6.486-1.652-2.944.982-8.21.264-11.696-1.611-3.495-1.867-7.005-2.856-7.811-2.202-.806.662-2.082.454-2.832-.463a2.163 2.163 0 0 1 .303-3.04zm16.531-8.105c.063-4.285-3.774-16.037-4.524-13.859-.582 1.7-1.34 1.341-2.114-1.013-.67-2.002-1.883-3.095-2.705-2.425-.822.678-.686 2.76.295 4.635 2.825 5.377 9.032 14.05 9.048 12.662zm-1.684-18.007c1.357 1.651 5.354-2.37 5.689-5.721.127-1.292-2.091-2.225-4.939-2.074-6.821.375-8.999 2.354-5.058 4.596 1.747.997 3.686 2.433 4.308 3.199zm83.356 101.793a2.16 2.16 0 0 0 .303-3.032 2.17 2.17 0 0 0-3.039-.303 2.161 2.161 0 0 0-.296 3.04 2.153 2.153 0 0 0 3.032.295zm7.085-11.496c3.358-.663 4.34-1.628 3.63-3.567-1.365-3.741-5.753-5.999-6.638-3.422-.407 1.18-1.388 1.348-2.186.375-.79-.974-2.194-1.149-3.112-.399-2.975 2.433 3.559 7.954 8.306 7.013zM76.856 292.481c.974-.789 2.386-.694 3.136.224.75.917 1.037 1.939.63 2.274-.407.327-1.819.231-3.135-.224-1.317-.454-1.604-1.476-.631-2.274zm10.348 12.438c.455-1.316 1.476-1.603 2.274-.63.79.973.694 2.378-.224 3.136-.917.75-1.938 1.029-2.273.63-.327-.407-.232-1.819.223-3.136zM54.47 251.035c.949-.128.805-2.242-.319-4.691-1.133-2.457-3.008-4.356-4.181-4.221-7.755.91-5.194-35.71 3.335-47.661 3.008-4.221 6.231-8.768 7.156-10.116 1.269-1.843-.024-2.825-5.186-3.974-8.76-1.938-9.749-5.169-4.403-14.416 5.281-9.151 15.732-19.778 14.017-14.249-.638 2.034-2.768 5.05-4.747 6.694-4.787 3.973-7.515 8.967-5.952 10.882.774.949 1.915.024 2.936-2.378.91-2.154 4.668-7.14 8.346-11.081 3.678-3.934 6.095-5.952 5.377-4.492s-.479 3.67.534 4.906c1.421 1.74.335 2.897-4.771 5.099-7.395 3.183-10.004 9.39-2.736 6.502 8.401-3.351 8.249 2.577-.407 15.828-3.215 4.923-4.763 9.814-3.782 11.96.918 1.994.966 4.204.096 4.914-.861.71-1.723.16-1.907-1.22-.758-5.689-4.619 1.699-7.85 15.03-2.258 9.311-2.433 14.8-.511 15.893 1.62.925 1.939 1.811.718 1.97-1.22.168-1.707 1.851-1.077 3.758 1.588 4.795 2.322 5.417 3.239 2.745.87-2.537 6.183 10.044 5.992 14.185-.072 1.388 1.029 3.183 2.441 3.989 1.404.798 2.154 2.649 1.652 4.109-.615 1.779-2.362.606-5.322-3.543-2.425-3.406-3.638-6.294-2.688-6.422zm3.079-73.391c4.316-.096 4.34-.208.232-1.125-2.506-.566-4.715-2.202-4.907-3.646-.191-1.444-1.149-1.971-2.114-1.173-2.792 2.282 1.516 6.056 6.789 5.944zm9.351 89.794c-1.915-3.51-1.724-4.372.782-3.51 4.443 1.531 4.435-1.181-.04-8.314-6.806-10.858-9.574-17.432-7.915-18.788.91-.742-.056-2.465-2.138-3.822-3.032-1.97-3.016-4.619.088-13.307 2.872-8.05 3.008-11.497.526-13.388-2.289-1.739-2.353-2.441-.215-2.233 4.699.47 8.497-6.16 5.569-9.734-1.412-1.731-1.779-3.797-.806-4.595.973-.79 1.915-.311 2.106 1.069.184 1.38 1.548 1.516 3.032.303 1.715-1.404 1.62-2.601-.263-3.271-2.266-.814-2.035-1.077.989-1.149 2.17-.048 6.119-2.026 8.776-4.404 2.896-2.577 7.276-4.077 10.93-3.726 3.351.327 10.619.399 16.148.16 9.262-.399 10.555.207 16.259 7.595 3.582 4.643 4.436 6.526 2.019 4.476-4.723-4.037-16.236-6.215-19.347-3.67-1.612 1.324-.718 2.465 4.101 5.258 5.712 3.31 6.039 4.156 4.459 11.536l-1.707 7.97 7.93.487c9.399.574 10.372 1.5 10.595 10.036.096 3.582.599 8.042 1.125 9.909.527 1.867-.455 1.101-2.186-1.691-1.731-2.801-3.877-4.5-4.763-3.766-.885.726-2.09-.112-2.672-1.867-1.5-4.539-17.544-6.67-22.1-2.936-3.662 2.992-2.984 7.651.774 5.29a349.228 349.228 0 0 0 3.957-2.545c1.165-.758 3.335-.615 4.827.327 1.994 1.26 1.603 2.042-1.508 2.984-2.314.702-5.178 2.01-6.359 2.912-1.18.893-3.127.439-4.316-1.014-1.508-1.834-2.226-.183-2.361 5.442-.16 6.765-1.173 8.576-6.207 11.129-3.487 1.771-5.457 3.742-4.691 4.675 2.122 2.593 14.655-6.358 13.554-9.677-1.196-3.622 10.053-11.84 13.515-9.869 1.381.782 3.894.375 5.577-.902 2.402-1.835 2.521-1.356.535 2.25-3.152 5.744-.838 8.968 3.741 5.218 1.891-1.548 3.583-1.676 3.774-.279.184 1.396 2.641 1.811 5.465.925 3.838-1.213 4.412-.989 2.298.878-1.723 1.516-1.763 3.813-.104 5.84 1.508 1.835 2.043 3.901 1.205 4.587-4.093 3.351-8.784 3.175-11.744-.439-2.577-3.151-4.149-3.271-7.436-.582-2.457 2.01-4.962 2.465-6.079 1.093-2.13-2.593-8.473-1.189-9.614 2.138-.407 1.189-1.252.622-1.867-1.245-1.228-3.693-4.005-2.074-7.691 4.5-2.106 3.742-1.85 3.917 4.492 3.247 3.694-.399 8.385-1.883 10.428-3.311 2.034-1.428 3.837-2.425 4.005-2.226.167.208 1.204 3.064 2.305 6.351 1.5 4.5 2.849 5.928 5.418 5.768 2.473-.159 2.417.176-.216 1.213-1.994.79-3.407 2.896-3.135 4.683.75 4.891-2.976 11.568-8.218 14.736-2.561 1.556-5.888 3.614-7.396 4.587-2.712 1.755-10.164-4.89-7.722-6.885 2.6-2.138-3.04-5.976-7.875-5.353-4.914.63-7.42-1.572-12.613-11.074zm17.943 7.364a2.172 2.172 0 0 0 .303-3.04 2.172 2.172 0 0 0-3.04-.303 2.171 2.171 0 0 0-.303 3.04 2.171 2.171 0 0 0 3.04.303zm.965-64.424c.574-5.8.303-6.31-2.266-4.196-1.611 1.316-2.409 3.957-1.779 5.864.846 2.553.375 3.207-1.755 2.473-1.692-.574-3.359.311-3.981 2.122-.798 2.322.231 2.769 4.029 1.731 4.092-1.117 5.225-2.688 5.752-7.994zm126.246 209.89c1.117-3.247 7.468-4.819 9.486-2.354 2.984 3.646-1.324 8.242-5.935 6.327-2.545-1.053-3.998-2.681-3.551-3.973zm36.564 32.622c3.08-2.521 7.125-1.18 6.032 2.003-.463 1.34-1.524 1.595-2.37.566-.838-1.021-1.899-.782-2.353.535-.447 1.316-1.476 1.603-2.266.63-.798-.973-.367-2.657.957-3.734zM53.153 213.402c.112-1.109.974-2.657 1.923-3.431 1.045-.853 1.588 0 1.372 2.178-.199 1.979-1.069 3.519-1.93 3.439-.862-.088-1.476-1.069-1.365-2.186zm61.735 67.455a2.154 2.154 0 1 1 2.73 3.335 2.154 2.154 0 0 1-2.73-3.335zm2.362-6.781c2.497-1.739 3.686-1.628 3.486.351-.191 1.978-1.484 2.88-3.781 2.649-2.625-.256-2.553-.998.295-3zm30.253 34.872c1.109-1.946 2.003-1.859 2.713.272.574 1.747.375 3.725-.439 4.396-2.402 1.962-4.085-1.492-2.274-4.668zm157.289 186.394c2.067.2 3.686 1.125 3.591 2.058-.088.934-1.78.774-3.758-.359-2.856-1.635-2.816-1.986.167-1.699zM109.87 254.306a2.161 2.161 0 0 1 3.032.303 2.147 2.147 0 0 1-.303 3.032 2.161 2.161 0 0 1-3.032-.303 2.161 2.161 0 0 1 .303-3.032zM303.508 487.38c1.38-.184 3.087.375 3.797 1.237.711.869.535 2.186-.382 2.935-.918.758-2.625.2-3.798-1.228-1.173-1.436-.997-2.753.383-2.944zM154.707 302.981c.351-1.037 1.787-.495 3.176 1.204 1.396 1.7 1.643 3.216.558 3.359-1.085.144-2.521-.399-3.183-1.212-.662-.806-.91-2.314-.551-3.351zm20.903 21.477c3.159.152 5.896 1.556 6.095 3.103.224 1.811-.718 1.947-2.616.383-1.636-1.348-3.67-1.882-4.516-1.18-.854.694-2.258.399-3.128-.663-.901-1.101.886-1.803 4.165-1.643zm10.42 17.049c-1.269-2.744-.543-4.22 2.76-5.6 2.465-1.03 5.489-2.402 6.726-3.04 3.558-1.843 11.065-1.301 12.892.925 2.21 2.697-2.457 11.872-8.592 16.898-4.316 3.526-5.378 3.439-8.497-.71-1.955-2.609-4.34-6.422-5.289-8.473zm-35.392-53.166c1.014-2.561.583-3.622-1.356-3.367-3.59.479-5.983-2.298-3.646-4.212.973-.79 1.947-.12 2.162 1.499.255 1.931.997 1.875 2.162-.175 1.325-2.314 2.242-2.114 3.566.79 1.357 2.944 2.657 3.191 5.338.997 3.087-2.529 3.63-2.274 4.172 1.979.766 5.959-2.712 11.177-7.156 10.738-4.747-.478-6.933-3.925-5.242-8.249zM311.933 487.46c-.24-2.107-1.811-5.529-3.487-7.604-3.486-4.324-1.013-7.228 6.495-7.635 3.646-.199 5.369-1.3 5.84-3.733.805-4.173-4.093-10.595-8.409-11.026-2.154-.216-1.357-1.372 2.529-3.71 3.119-1.867 6.255-2.689 6.965-1.819.71.862 1.587.71 1.946-.343.367-1.053 2.761-1.205 5.322-.343 2.561.869 3.981 2.138 3.151 2.816-.83.686.862 3.877 3.766 7.101 5.114 5.68 6.119 10.954 3.031 15.852-1.18 1.867.144 3.479 6.303 7.635 4.292 2.888 8.114 5.003 8.489 4.699 1.859-1.523 5.904-11.544 5.066-12.565-.518-.638 1.221-2.8 3.87-4.811 6.885-5.21 11.823.479 8.432 9.717-2.577 7.053.336 14.034 5.098 12.223 3.686-1.404 9.223-8.449 7.907-10.052-1.468-1.796-.543-10.58 1.268-12.063 2.849-2.33 11.042-.128 14.289 3.829 2.41 2.944 4.237 3.303 6.654 1.324 2.569-2.098 2.433-3.845-.59-7.531-6.582-8.042-10.492-16.842-8.29-18.645 4.269-3.502 10.867.016 18.741 9.989 9.079 11.496 12.127 11.097 8.728-1.125-2.106-7.579-1.955-8.146 1.412-5.178 2.075 1.843 4.093 6.303 4.476 9.917.566 5.273 1.739 7.092 5.92 9.151 4.994 2.449 4.97 2.752-.471 6.725-8.959 6.55-9.741 7.723-7.22 10.859 1.38 1.707 1.26 2.64-.271 2.218-1.452-.399-7.651 3.422-13.771 8.488-6.765 5.593-12.629 9.064-14.927 8.832-5.218-.518-7.467 1.739-3.813 3.822 1.659.941 2.098 2.465.981 3.39-1.109.918 1.125 1.022 4.962.216 3.846-.798 7.651-2.609 8.457-4.029.806-1.42 2.585-2.194 3.957-1.723 1.492.518 7.173-3.423 14.249-9.869 7.356-6.702 12.59-10.284 13.962-9.558 1.388.742 2.09-.112 1.923-2.346-.208-2.896.231-3.231 2.545-1.907 1.54.878 2.912 4.484 3.056 8.01.143 3.527 1.444 7.093 2.888 7.915 1.659.949 1.332 2.569-.886 4.38-1.931 1.587-4.228 2.002-5.106.933-.878-1.069-1.667-1.228-1.755-.359-.351 3.535 6.526 5.114 9.223 2.122 3.526-3.925 2.457-18.182-1.333-17.679-1.595.207-1.891-.942-.758-2.936 1.093-1.915 2.011-2.25 2.202-.798.383 2.872 1.213 2.433 3.734-1.994 2.17-3.806-2.441-10.244-5.529-7.715-1.197.981-2.306 3.127-2.465 4.787-.2 1.978-2.864 2.026-7.843.143-4.148-1.572-6.51-2.808-5.249-2.744 3.742.199 6.247-8.497 2.976-10.364-1.628-.925-2.131-1.803-1.109-1.947 1.013-.143 1.723-3.039 1.571-6.446-.247-5.752-.582-6.183-4.874-6.167-4.069.008-4.141.287-.631 2.33 2.865 1.667 3.056 2.225.679 2.002-2.226-.215-3.838-2.042-4.987-5.672-.925-2.944-1.013-4.66-.191-3.798.821.862 3.127 2.106 5.114 2.768 3.111 1.03 3.598.431 3.478-4.244-.143-5.218-.072-5.218 1.827.056 1.085 3.024 2.465 10.85 3.072 17.4 1.141 12.271 2.305 15.901 3.75 11.696 1.404-4.069 9.063-5.928 11.608-2.816 1.324 1.611 2.074 5.617 1.675 8.896-1.252 10.275-1.34 11.839-1.013 19.426.359 8.441-2.705 11.896-10.22 11.521-4.787-.24-5.329-.822-6.702-7.308-2.281-10.779-5.64-11.337-15.988-2.657-10.77 9.039-14.592 10.858-31.873 15.159-14.392 3.582-17.568 2.999-10.722-1.979 2.401-1.739 5.138-2.234 6.071-1.085.941 1.149 2.465 1.468 3.383.718 2.297-1.883-4.332-9.606-7.851-9.135-1.563.207-2.529 2.13-2.146 4.268.375 2.138-.758 4.372-2.529 4.955-1.771.59-3.383-.136-3.574-1.604-.224-1.659-1.053-1.46-2.178.511-1.005 1.755-3.295 2.904-5.098 2.553-2.362-.455-2.226-1.604.502-4.125 2.545-2.345 5.059-2.657 7.675-.949 3.591 2.337 3.838 2.202 3.144-1.7-.607-3.43-3.614-4.428-15.749-5.217-12.598-.822-15.773-1.931-19.858-6.909-3.837-4.692-7.882-6.407-19.203-8.146-16.028-2.457-15.111-2.035-15.693-7.244zm99.176-25.467c.862-.702.95-2.034.2-2.952-.75-.917-2.537-.71-3.965.463-1.436 1.173-1.524 2.497-.208 2.952 1.325.455 3.104.247 3.973-.463zm22.666 17.68c1.835-1.508 2.761-3.439 2.051-4.308-1.835-2.234-6.16-1.325-7.133 1.5-1.396 4.053 1.564 5.688 5.082 2.808zm-108.223 22.291c.59-4.396 1.715-3.502 3.829 3.048 1.069 3.287.726 3.877-1.5 2.608-1.58-.901-2.625-3.446-2.329-5.656zm-68.908-83.523c.407-.335 1.819-.232 3.136.223 1.316.447 1.603 1.476.63 2.266-.973.798-2.386.694-3.136-.224-.749-.917-1.037-1.938-.63-2.265zm-84.879-117.08c1.476-3.566 4.499-6.486 8.943-8.656 3.686-1.803 7.292-4.093 8.002-5.098 1.556-2.178 1.173 12.885-.463 18.166-1.715 5.553-6.398 9.199-8.512 6.622-1.021-1.253-2.617-1.659-3.535-.91-3.303 2.705-6.621-4.858-4.435-10.124zm9.916 19.371c.176-.255 1.772-2.194 3.559-4.308 2.712-3.215 3.199-3.167 2.999.263-.127 2.258-1.045 3.622-2.034 3.048-.997-.583-2.146-.072-2.561 1.133-.407 1.204-1.093 1.771-1.516 1.26-.415-.51-.622-1.141-.447-1.396zM330.897 497.01a2.17 2.17 0 0 1 3.04.303 2.16 2.16 0 0 1-.304 3.031 2.16 2.16 0 0 1-3.031-.303 2.151 2.151 0 0 1 .295-3.031zM140.355 262.795c1.755-1.444 5.122 1.157 4.356 3.367-.455 1.34-1.795 1.268-2.968-.16-1.173-1.436-1.795-2.872-1.388-3.207zm153.818 179.724c1.476-.694 4.5-2.745 6.718-4.564 2.992-2.449 4.779-2.393 6.917.216 1.995 2.433 3.407 2.593 4.596.502.941-1.651 2.209-2.409 2.808-1.667 2.122 2.585.662 5.329-2.808 5.305-2.434-.016-3.407.79-3.16 2.609.192 1.452-1.109 3.83-2.888 5.29-2.465 2.018-4.196 1.492-7.228-2.218-2.194-2.673-4.803-4.715-5.808-4.54-1.005.184-.615-.239.853-.933zM73.817 169.722c.742-2.801.478-5.394-.583-5.753-1.061-.367-.415-1.172 1.444-1.787 4.596-1.524 1.022-12.717-4.412-13.77-2.951-.575-3.191-1.221-1.085-2.952 4.923-4.029 11.792 6.271 10.38 15.565-.766 5.003-.144 6.878 2.362 7.125 1.866.183 4.204-.327 5.193-1.133 2.665-2.186 30.429-.718 30.238 1.596-.096 1.093-3.742 1.635-8.106 1.196-4.364-.43-8.306.311-8.768 1.652-.463 1.34-1.444 1.268-2.186-.152-.886-1.691-2.673-1.26-5.178 1.253-2.904 2.912-3.55 2.976-2.673.247.91-2.816-.917-2.992-8.409-.798-9.127 2.665-9.51 2.561-8.217-2.289zM228.8 360.4c1.381-1.125 3.096-1.317 3.83-.431.726.893-.16 2.106-1.971 2.704-1.803.599-3.526.798-3.821.439-.295-.367.59-1.58 1.962-2.712zm127.906 154.505c-.263-2.298.224-3.04 1.221-1.859.909 1.077 1.276 3.039.83 4.364-1.03 2.976-1.5 2.393-2.051-2.505zM135.201 240.687c1.26-.167 1.188-1.675-.152-3.351-2.058-2.545-1.867-2.848 1.149-1.842 2.497.829 3.183 2.233 2.258 4.587-.726 1.867-.088 3.869 1.428 4.452 1.524.574 1.643.989.271.917-3.423-.175-7.803-4.388-4.954-4.763zm8.672 4.931c.949-4.245 1.053-4.229 1.149.111.096 4.564-.551 6.574-1.676 5.202-.287-.351-.047-2.736.527-5.313zm95.722 109.484c1.883-1.316 3.534-1.548 3.678-.511.135 1.03-1.205 2.362-2.976 2.944-4.46 1.476-4.771.415-.702-2.433zm13.906 10.164c.861-.71 4.093-2.122 7.172-3.159 6.103-2.035 9.47.558 10.436 8.026.558 4.364.111 4.819-5.338 5.401-5.928.63-15.645-7.507-12.27-10.268zM135.927 219.035c-2.37-6.838-.998-13.244 2.832-13.22 2.01.008 4.005-.99 4.428-2.226 1.029-2.992 9.039 3.103 10.722 8.162 2.163 6.494 1.197 10.339-3.135 12.414-8.114 3.901-12.207 2.489-14.847-5.13zM325.863 439.83c2.194-5.297 10.291-7.842 12.35-3.893 3.766 7.212 3.494 10.3-.989 11.185-2.482.487-6.479.072-8.88-.925-3.511-1.46-3.997-2.713-2.481-6.367zM163.172 240.105c2.162-.718 3.846-.543 3.758.391-.096.933-1.859 1.524-3.925 1.308-2.984-.311-2.952-.654.167-1.699zm24.685 31.354c-.846-6.941 7.706-4.444 14.584 4.252 3.406 4.309 4.842 7.053 3.191 6.104-1.652-.95-5.864-2.378-9.351-3.176-7.212-1.643-7.81-2.154-8.424-7.18zm20.711 21.884c.973-.798 2.385-.694 3.135.224.75.917 1.037 1.938.63 2.273-.406.327-1.811.232-3.135-.223-1.316-.455-1.596-1.476-.63-2.274zm10.172 13.276c-1.779-3.87 1.484-7.779 5.377-6.447 1.333.463 2.705.048 3.04-.933.335-.973 3.151.989 6.263 4.364 6.837 7.412 6.135 10.731-2.489 11.648-6.255.662-8.729-1.085-12.191-8.632zM116.037 173.894c3.048-.662 5.457-.367 5.353.654-.103 1.014-2.592 1.556-5.536 1.189-5.114-.622-5.106-.71.183-1.843zm234.351 289.041c1.38-.184 3.087.375 3.797 1.236.71.862.535 2.186-.383 2.936-.917.75-2.625.192-3.797-1.236-1.173-1.428-.998-2.753.383-2.936zM175.802 246.312c1.292-3.774 5.552-3.423 8.959.726 3.798 4.651 3.702 7.108-.335 8.441-4.165 1.38-6.095-1.436-4.947-7.22.91-4.572.846-4.644-1.22-1.492-2.362 3.614-3.766 3.358-2.457-.455zM307.84 401.104c1.771-9.925 11.951-4.125 14.169 8.074l1.045 5.768-5.951-1.675c-7.795-2.186-10.428-5.649-9.263-12.167zm35.343 47.574c1.013.104 2.25 1.492 2.753 3.095.558 1.764-.16 1.692-1.835-.183-1.508-1.699-1.923-3.008-.918-2.912zm7.97 6.606c.679-3.503 1.014-3.598 2.011-.591.654 1.979.519 4.149-.303 4.819-2.146 1.763-2.633.551-1.708-4.228zM219.442 292.809c.918-.758 1.939-1.038 2.274-.631.327.399.231 1.811-.224 3.128-.454 1.324-1.476 1.603-2.273.63-.79-.973-.694-2.377.223-3.127zM404.4 512.08c1.89-1.54 4.053-2.058 4.803-1.141.757.918.287 2.553-1.038 3.638-1.324 1.085-3.478 1.596-4.803 1.141-1.316-.446-.845-2.09 1.038-3.638zM284.831 357.264c1.149-.941 2.744-.614 3.55.726 2.497 4.165 1.285 6.008-2.258 3.439-1.97-1.436-2.505-3.168-1.292-4.165zm79.143 96.44c-.319-4.22-1.452-6.143-3.893-6.622-1.899-.367-4.619-2.345-6.055-4.388-2.003-2.864-1.588-4.284 1.795-6.167 4.308-2.385 4.076-4.468-.998-9.127-1.986-1.819-1.643-2.13 2.322-2.098 2.721.016 5.417 1.699 6.494 4.053 1.149 2.497 4.939 4.603 10.013 5.553l8.161 1.523 1.652 10.516c.909 5.776 2.657 10.642 3.885 10.802 1.237.168-.295.654-3.39 1.085-3.096.431-6.096.215-6.662-.487-.575-.694-2.92.272-5.21 2.154-4.803 3.934-7.475 1.692-8.114-6.797zm19.284 3.223c.406-.335.119-1.356-.631-2.274-.75-.917-2.162-1.021-3.135-.223-.966.798-.686 1.819.63 2.274 1.324.455 2.729.55 3.136.223zm-4.875-15.174c.287-2.992-.064-3.024-1.699-.168-1.133 1.971-1.293 3.662-.359 3.758.933.088 1.858-1.524 2.058-3.59zm-78.784-69.346c.877-4.492 7.124-7.053 9.661-3.95.989 1.205 3.215 3 4.955 3.99 5.465 3.119-.04 9.031-7.061 7.579-7.404-1.532-8.521-2.649-7.555-7.619zm-25.052-32.735c2.011.647 4.276 1.931 5.026 2.848.758.918-.279 1.141-2.297.487-2.019-.646-4.285-1.923-5.035-2.848-.749-.918.288-1.133 2.306-.487zm19.778 17.64c-.343-2.545.335-2.84 3.024-1.308 4.18 2.385 4.284 3.678.351 4.204-1.7.231-3.12-.989-3.375-2.896zm120.837 148.992c3.303-2.417 10.906-3.997 8.337-1.731-1.332 1.173-4.148 2.329-6.255 2.569-2.106.239-3.039-.144-2.082-.838zm-84.05-114.646c-2.521-8.058 5.298-8.234 17.353-.399 3.678 2.386 8.728 14.536 6.717 16.18-2.409 1.97-8.847-.375-9.916-3.622-.591-1.771-3.016-3.231-5.402-3.239-4.842-.04-6.494-1.716-8.752-8.92zm11.13-11.712c1.332-1.093 2.553-1.029 2.712.144.152 1.172-.765 2.273-2.058 2.449-3.287.439-3.47-.287-.654-2.593zm53.007 47.829c.582-3.016 1.954-4.061 5.999-4.579 5.186-.671 10.117 3.35 12.335 10.044 1.037 3.12.438 3.566-6.024 4.564-7.811 1.196-13.579-3.503-12.31-10.029zm57.275 71.389c.455-1.317 1.476-1.604 2.274-.631.79.974.694 2.378-.224 3.136-.917.75-1.938 1.029-2.273.63-.328-.407-.232-1.819.223-3.135z',
									fill: '#b64b25',
								}),
								yt.createElement('path', {
									d: 'M108.083 333.816a2.161 2.161 0 0 1 3.032.303c.75.918.614 2.282-.304 3.04a2.16 2.16 0 0 1-3.031-.303 2.163 2.163 0 0 1 .303-3.04zm4.236-11.728c.12-4.3-1.164-7.659-3.518-9.198-2.425-1.58-2.753-2.537-.949-2.777 1.723-.231 1.587-1.037-.367-2.146-1.708-.973-4.157-.917-5.434.128-3.095 2.529-6.733-2.186-6.159-7.97.288-2.889 1.931-5.051 4.364-5.737 2.146-.606 4.987-2.226 6.311-3.606 1.316-1.372 4.3-2.13 6.63-1.675 2.322.454 3.67 1.284 2.984 1.843-.686.558.614 1.38 2.888 1.819 2.266.438 5.417-.264 6.997-1.556 4.148-3.391 14.695-2.585 17.935 1.372 2.305 2.816 1.659 7.372-1.644 11.608-.375.479-1.372 2.713-2.218 4.963-1.332 3.534-.766 4.46 4.229 6.861 3.845 1.851 6.446 1.739 7.81-.335 3.168-4.827 15.949 9.095 13.898 15.143-1.795 5.305-8.888 8.504-11.576 5.217-1.077-1.316-2.992-1.548-4.253-.518-1.675 1.38-.414 3.957 4.74 9.677 3.861 4.292 8.273 8.234 9.805 8.76 3.271 1.125 9.55 12.606 7.076 12.933-.925.119.104 2.401 2.29 5.074 3.159 3.853 4.707 4.236 7.579 1.883 1.995-1.628 3.231-4.213 2.753-5.737-.479-1.523.766-.973 2.76 1.229 3.558 3.933 3.59 3.893 1.676-2.673-2.482-8.544 1.196-7.244 9.127 3.224 4.356 5.744 7.515 8.185 10.443 8.057 2.314-.103 5.8.734 7.739 1.867 2.577 1.492 4.404.886 6.741-2.257 3.463-4.66 8.992-4.309 8.505.542-.159 1.612-1.651 4.228-3.319 5.816-3.247 3.096.455 10.085 3.862 7.292 2.074-1.699 7.004.399 10.259 4.372 1.062 1.309.687 3.399-.845 4.651-1.532 1.253-2.011 2.354-1.061 2.442.949.096 1.372 4.148.941 9.007-.67 7.635-.056 9.239 4.548 11.888 6.933 3.981 13.451 3.63 19.275-1.022 5.345-4.276 4.524-9.988-1.604-11.177-2.25-.439-3.534-1.253-2.848-1.819.678-.559-.566-1.364-2.768-1.795-5.322-1.029-5.649-5.25-.718-9.287 2.561-2.098 7.148-2.521 12.813-1.172 9.916 2.353 13.14 5.01 9.605 7.906-1.316 1.069-2.593 4.021-2.84 6.55-.415 4.109.279 4.891 6.47 7.3 5.745 2.234 6.742 3.255 5.832 5.984-1.492 4.459-8.313 7.347-10.642 4.499-2.761-3.367-5.258-.415-4.197 4.971 1.101 5.576 9.678 16.506 12.294 15.661 2.665-.854 13.475 9.215 13.978 13.012.335 2.489-1.819 3.806-9.861 6.024-5.8 1.603-10.411 3.997-10.555 5.473-.152 1.484-5.641-4.189-12.574-12.981-12.158-15.414-19.889-20.998-19.012-13.738.224 1.811-.263 2.497-1.077 1.54-.805-.966-1.284-4.652-1.061-8.194.399-6.271-2.082-7.22-2.696-1.037-.455 4.603-11.744 2.258-16.379-3.399-2.107-2.577-2.968-4.787-1.923-4.93 1.045-.136 2.106-2.282 2.353-4.771.599-6-2.84-16.18-4.89-14.497-.87.71-2.019-.031-2.553-1.651-.694-2.106-2.33-1.691-5.745 1.46-2.624 2.417-4.89 3.454-5.05 2.298-.151-1.157-1.053-1.468-2.002-.694-4.157 3.406-14.648-4.572-23.376-17.784-.495-.75.351-2.385 1.883-3.638 1.531-1.252 1.882-2.361.781-2.473-1.101-.112-1.986-1.891-1.97-3.965.016-2.067-.638-3.215-1.444-2.553-.814.662-1.165 3.606-.79 6.55.415 3.215-.415 5.226-2.082 5.066-5.114-.511-11.178-9.622-18.111-27.19-1.348-3.43-2.537-4.196-4.276-2.768-1.324 1.085-4.364 1.596-6.75 1.133-3.59-.702-4.14-1.436-3.183-4.324.694-2.091.367-2.848-.814-1.907-2.241 1.787-8.8-11.066-8.815-17.265-.008-4.005-10.013-6.59-12.774-3.311-.925 1.093-4.148-.79-7.619-4.444-4.396-4.627-5.967-8.169-5.832-13.124zm-8.951-17.855a2.162 2.162 0 0 0 .295-3.039 2.162 2.162 0 0 0-3.032-.304 2.171 2.171 0 0 0-.303 3.04 2.17 2.17 0 0 0 3.04.303zm20.823 13.882c-1.333-6.414-1.101-10.124.59-9.542 4.292 1.476 7.364-2.257 5.393-6.55-3.909-8.528-16.163-2.616-15.405 7.428.239 3.207 2.944 8.832 6.015 12.494l5.577 6.662-2.17-10.492zm6.494-6.135c.096-.933-1.596-1.109-3.75-.391-3.119 1.045-3.159 1.388-.175 1.7 2.066.215 3.837-.375 3.925-1.309zm76.287 98.355c.447-1.317.24-3.104-.463-3.965-.71-.87-2.034-.958-2.959-.208-.918.75-.711 2.537.462 3.965 1.173 1.436 2.505 1.524 2.96.208zm3.319-10.244c5.138.51 7.835-2.266 6.399-6.59-1.452-4.388-12.542-6.159-13.89-2.226-1.205 3.494 2.928 8.361 7.491 8.816zm49.872 37.768a2.17 2.17 0 0 0 .303-3.039 2.16 2.16 0 0 0-3.032-.303 2.17 2.17 0 0 0-.303 3.039 2.16 2.16 0 0 0 3.032.303zM55.882 250.413c1.739-.575 2.824.247 2.856 2.178.04 1.715.574 4.571 1.205 6.358.63 1.787-.654.806-2.856-2.178-2.657-3.614-3.064-5.744-1.205-6.358zm11.353 16.498c-1.388-3.51-1.229-4.332.478-2.481 1.405 1.532 3.128 2.322 3.822 1.747 2.705-2.209-.255-11.009-6.542-19.45-3.622-4.851-5.928-9.359-5.122-10.021.798-.654.415-4.045-.87-7.539-1.276-3.487-1.316-7.883-.087-9.765 1.228-1.883 2.704-6.846 3.279-11.034.574-4.181 1.3-7.3 1.595-6.933.303.367 2.33-2.681 4.508-6.766 4.053-7.627 14.185-14.664 16.698-11.592.734.894 1.676.638 2.098-.566 2.322-6.758 31.65-2.49 33.947 4.93.575 1.851.2 1.995-1.188.487-2.577-2.801-13.555-3.176-16.738-.567-1.333 1.093-1.301 2.641.063 3.431 10.125 5.864 10.779 6.917 8.505 13.643-1.253 3.709-2.393 7.18-2.545 7.698-.144.527 3.694 1.006 8.537 1.07 4.85.063 9.254.654 9.789 1.316.542.654 1.149 5.377 1.356 10.491l.375 9.295-3.287-6.295c-2.633-5.05-5.114-6.718-12.597-8.497-5.122-1.22-10.771-1.021-12.55.439-2.162 1.771-3.375 1.612-3.662-.487-.582-4.316-5.202 9.845-5.417 16.611-.12 3.686-2.059 6.773-5.912 9.43-3.151 2.178-5.337 5.066-4.851 6.415 1.269 3.542 15.007-6.199 16.419-11.633.878-3.398 2.067-4.435 5.09-4.412 3.064.016 3.846-.789 3.479-3.59-.287-2.186-1.293-3.311-2.545-2.848-1.141.423-2.657.056-3.375-.822-.718-.877 1.101-2.058 4.093-2.648 3.327-.655 4.811-.144 3.885 1.332-1.771 2.792 7.037 14.44 9.438 12.478.886-.726 2.107.151 2.705 1.962.686 2.083 2.074 2.49 3.766 1.093 2.999-2.449 3.343-2.265 4.978 2.673 1.859 5.633-3.199 7.659-8.417 3.375-4.117-3.375-5.377-3.319-8.457.367-2.92 3.494-3.845 3.63-4.811.718-1.14-3.447-3.366-2.912-9.27 2.21-1.053.909-2.41.143-3.024-1.715-.885-2.665-1.779-2.45-4.268 1.013-1.731 2.409-4.173 5.241-5.425 6.287-4.021 3.358 5.345 3.813 12.326.59 7.707-3.566 12.039-.447 11.488 8.265-.231 3.59.008 7.053.535 7.691.519.638-1.029 3.343-3.455 6-3.007 3.295-4.978 4.133-6.215 2.617-.997-1.213-2.561-1.596-3.478-.846-.918.75-.654 2.609.582 4.125 1.787 2.17.838 2.513-4.435 1.603-3.83-.654-6.152-2.026-5.41-3.199 1.987-3.143-1.5-6.167-9.023-7.835-7.364-1.635-7.747-1.978-10.858-9.861zm18.541 7.125c1.428-1.173 1.516-2.505.199-2.952-1.316-.455-3.103-.247-3.965.455-.861.71-.957 2.042-.207 2.96.75.917 2.537.71 3.973-.463zm11.233-.319c-.502-1.596-1.739-2.992-2.752-3.088-1.005-.103-.591 1.205.917 2.904 1.676 1.883 2.394 1.955 1.835.184zm-15.773-55.72c3.136-1.484 5.178-4.316 5.864-8.161 1.389-7.755-.151-9.239-5.249-5.066-3.192 2.616-3.463 4.3-1.141 7.212 2.72 3.423 2.609 3.646-1.117 2.25-2.282-.854-4.492-.535-4.915.702-1.372 3.989 1.62 5.385 6.558 3.063zm28.323-15.924c.223-2.258-.606-1.939-2.792 1.061-1.772 2.433-1.907 3.814-.32 3.207 1.532-.59 2.936-2.505 3.112-4.268zM46.133 237.36c-3.032-8.911 1.268-34.625 7.172-42.898 3.008-4.221 6.231-8.768 7.156-10.116 1.269-1.843-.024-2.825-5.186-3.974-3.781-.837-7.284-2.752-7.786-4.26-1.093-3.303 5.888-15.837 12.318-22.099 6.223-6.072 3.766.271-3.319 8.56-5.96 6.965-3.095 10.882 5.122 7.013 8.074-3.806 8.928 1.508 2.146 13.379-3.526 6.167-7.18 11.84-8.121 12.614-1.907 1.556-8.792 26.28-8.513 30.572.096 1.5 1.284 3.383 2.625 4.181 1.348.789 1.436 1.97.199 2.624-1.237.647-1.404 2.833-.375 4.851 1.077 2.114 2.226 2.649 2.705 1.269.494-1.436 1.579-.758 2.696 1.683 1.037 2.242 1.492 5.218 1.014 6.598-.551 1.604-1.349 1.061-2.194-1.508-.734-2.21-2.37-3.893-3.638-3.75-1.341.16-3.032-1.835-4.021-4.739zm12.07-58.918c7.524-.28 8.625-2.593 1.453-3.048-3.575-.231-6.646-1.484-6.814-2.776-.175-1.301-1.117-1.716-2.082-.918-2.832 2.314 2.274 6.933 7.443 6.742zM212.916 418.01c2.186-1.787 8.88-.064 8.648 2.234-.415 4.156-4.755 5.513-7.38 2.305-1.507-1.835-2.074-3.877-1.268-4.539zm35.702 34.88c1.325-1.085 3.415-1.619 4.651-1.196 1.245.422.647 1.898-1.324 3.279-4.045 2.832-7.045.957-3.327-2.083zM53.153 213.402c.112-1.109.974-2.657 1.923-3.431 1.045-.853 1.588 0 1.372 2.178-.199 1.979-1.069 3.519-1.93 3.439-.862-.088-1.476-1.069-1.365-2.186zm61.735 67.455a2.154 2.154 0 1 1 2.73 3.335 2.154 2.154 0 0 1-2.73-3.335zm32.232 29.352c.973-.79 2.386-.694 3.135.223.75.918 1.038 1.939.631 2.274-.407.327-1.819.231-3.136-.223-1.316-.455-1.603-1.476-.63-2.274zm157.672 185.133c2.067.2 3.686 1.125 3.591 2.058-.088.934-1.78.774-3.758-.359-2.856-1.635-2.816-1.986.167-1.699zM109.87 254.306a2.161 2.161 0 0 1 3.032.303 2.147 2.147 0 0 1-.303 3.032 2.161 2.161 0 0 1-3.032-.303 2.161 2.161 0 0 1 .303-3.032zM303.508 487.38c1.38-.184 3.087.375 3.797 1.237.711.869.535 2.186-.382 2.935-.918.758-2.625.2-3.798-1.228-1.173-1.436-.997-2.753.383-2.944zM175.61 324.458c3.159.152 5.896 1.556 6.095 3.103.224 1.811-.718 1.947-2.616.383-1.636-1.348-3.67-1.882-4.516-1.18-.854.694-2.258.399-3.128-.663-.901-1.101.886-1.803 4.165-1.643zm13.355 19.929c.415-1.204 1.604-1.667 2.649-1.029 1.221.758 2.306-.127 3.072-2.497.981-3.048.407-3.319-3.423-1.62-2.521 1.125-5.138 1.389-5.8.575-1.699-2.082 3.08-5.593 6.159-4.532 1.412.487 3.279-.367 4.149-1.899.885-1.555 3.702-1.89 6.406-.773 3.957 1.643 4.604 2.84 3.598 6.701-1.491 5.784-5.042 8.936-7.164 6.351-.893-1.093-1.947.566-2.441 3.829-.838 5.609-.95 5.641-4.412 1.421-1.947-2.386-3.207-5.322-2.793-6.527zm136.587 157.577c.59-4.396 1.715-3.502 3.829 3.048 1.069 3.287.726 3.877-1.5 2.608-1.58-.901-2.625-3.446-2.329-5.656zM145.54 280.849c.918-.758 1.939-1.037 2.274-.638.327.407.232 1.819-.223 3.135-.455 1.325-1.476 1.604-2.274.631-.798-.974-.694-2.378.223-3.128zm5.904 8.226c.367-1.069 3.072-3.247 6.008-4.843 4.156-2.258 5.329-2.082 5.313.798-.016 2.034-1.595 4.22-3.518 4.859-2.473.813-2.577 1.46-.367 2.225 2.09.719 2.146 1.437.159 2.194-3.366 1.285-8.6-2.321-7.595-5.233zm105.2 129.366c.407-.335 1.819-.232 3.136.223 1.316.447 1.603 1.476.63 2.266-.973.798-2.386.694-3.136-.224-.749-.917-1.037-1.938-.63-2.265zm52.76 63.418c-4.109-6.454-2.083-9.965 5.313-9.231 6.048.599 8.202-1.436 7.149-6.773-.599-3.032-2.593-5.13-6.455-6.79-5.257-2.265-5.321-2.553-1.109-4.834 2.466-1.341 6.112-1.381 8.09-.08 1.987 1.292 3.933 1.412 4.332.271.391-1.149 1.843-.471 3.223 1.5 1.373 1.971 1.835 4.133 1.014 4.803-.822.67-.343 1.843 1.069 2.609 1.404.766 4.148 2.258 6.095 3.327 2.617 1.444 2.761 3.295.543 7.156-3.503 6.103-1.668 9.007 8.081 12.757 7.931 3.056 9.901 2.234 12.008-5.002.789-2.721 3.039-6.837 4.986-9.135 2.896-3.415 4.157-3.519 6.893-.575 1.843 1.987 2.824 3.95 2.178 4.364-4.069 2.633-6.119 9.774-4.061 14.146 3.072 6.518 5.21 6.55 15.278.215 5.226-3.287 6.87-4.978 4.54-4.675-5.321.686-5.896-7.603-.822-11.76 3.287-2.689 4.979-2.361 9.606 1.891 7.739 7.1 14.64 3.279 11.177-6.183-1.683-4.604-1.38-6.869 1.022-7.659 2.217-.734 2.64-2.074 1.22-3.814-2.593-3.167-3.446-2.672-6.007 3.495-1.524 3.686-2.091 3.997-2.737 1.547-.447-1.699-1.428-4.786-2.17-6.853-1.46-4.021 1.612-7.882 5.266-6.622 1.212.415 6.462 5.8 11.672 11.96l9.454 11.209-.032-6.47c-.024-3.559-.854-7.468-1.859-8.689-.997-1.22-1.428-3.342-.957-4.715 1.212-3.526 6.318 7.795 5.808 12.885-.327 3.335.782 4.532 6.534 7.013l6.925 2.992-.2-6.59c-.111-3.622-1.021-9.989-2.026-14.154-.997-4.164-1.5-7.834-1.109-8.153 1.452-1.181 4.117 9.813 5.186 21.389 1.141 12.271 2.305 15.901 3.75 11.696 1.404-4.069 9.063-5.928 11.608-2.816 1.324 1.611 2.074 5.617 1.675 8.896-1.252 10.275-1.34 11.839-1.013 19.426.359 8.441-2.705 11.896-10.22 11.521-4.787-.24-5.329-.822-6.702-7.308-2.281-10.779-5.64-11.337-15.988-2.657-4.938 4.141-11.145 8.505-13.786 9.694-6.734 3.023-31.187 8.967-32.184 7.826-1.859-2.146 7.164-6.694 10.132-5.106 4.819 2.585 23.783-5.72 36.101-15.805l10.875-8.903 4.013 6.925c2.896 4.994 4.108 5.999 4.348 3.622.175-1.819-1.325-5.322-3.335-7.779-2.601-3.175-2.705-4.164-.351-3.406 2.744.885 3.239.406 2.904-2.785-.375-3.558 1.516-3.151 3.702.798.51.925 1.747.239 2.744-1.524 1.061-1.843 1.963-2.146 2.154-.71.527 3.933 5.122-.989 5.154-5.521.032-5.042-3.941-6.646-8.082-3.263-1.707 1.396-4.707 3.072-6.661 3.718-3.264 1.085-3.543.726-3.295-4.268.255-5.21.047-5.282-4.739-1.676-3.088 2.33-4.093 2.537-2.633.527 1.308-1.787 1.42-3.846.255-4.588-3.758-2.369-6.279.088-7.212 7.029-.511 3.734-3.176 8.832-5.92 11.345-2.752 2.513-5.784 6.151-6.734 8.098-3.797 7.715-42.866 11.792-48.387 5.042-.71-.87-3.558-.511-6.319.79-2.768 1.308-6.159 1.237-7.539-.152a532.893 532.893 0 0 1-6.638-6.917c-5.202-5.513-14.616-9.526-17.273-7.348-4.515 3.694-13.235-1.308-19.522-11.193zm142.386 32c4.93 1.277 5.042 1.165 5.984-5.991 1.14-8.704-1.365-15.159-5.37-13.834-3.111 1.029-3.55 5.042-1.268 11.456 1.172 3.287.67 4.013-2.737 3.989-5.297-.032-3.199 2.681 3.391 4.38zM171.693 302.805c.606-4.029 2.497-6.406 6.853-8.616 7.42-3.766 10.068-3 10.858 3.175 1.189 9.255-1.611 13.284-9.35 13.435-8.481.168-9.446-.75-8.361-7.994zM330.897 497.01a2.17 2.17 0 0 1 3.04.303 2.16 2.16 0 0 1-.304 3.031 2.16 2.16 0 0 1-3.031-.303 2.151 2.151 0 0 1 .295-3.031zM140.355 262.795c1.755-1.444 5.122 1.157 4.356 3.367-.455 1.34-1.795 1.268-2.968-.16-1.173-1.436-1.795-2.872-1.388-3.207zm45.387 53.31c1.373-3.981 3.016-2.761 2.378 1.763-.319 2.234-1.181 3.327-1.915 2.425-.734-.893-.941-2.784-.463-4.188zM64.594 156.358c6.654-7.914 8.76-7.707 4.396.439-2.314 4.316-4.396 6.255-6.502 6.047-2.099-.215-1.428-2.289 2.106-6.486zM228.8 360.4c1.381-1.125 3.096-1.317 3.83-.431.726.893-.16 2.106-1.971 2.704-1.803.599-3.526.798-3.821.439-.295-.367.59-1.58 1.962-2.712zm70.471 85.158c-3.39-5.887 4.309-12.549 8.537-7.387 1.995 2.433 3.407 2.593 4.596.502.941-1.651 2.209-2.409 2.808-1.667 2.138 2.601.654 5.329-2.88 5.305-2.529-.016-4.133 1.309-5.457 4.5-2.146 5.162-4.085 4.843-7.604-1.253zm57.435 69.347c-.263-2.298.224-3.04 1.221-1.859.909 1.077 1.276 3.039.83 4.364-1.03 2.976-1.5 2.393-2.051-2.505zM76.114 163.267c1.181-4.755.415-8.576-2.505-12.422-3.997-5.265-3.853-9.773.184-5.672 5.074 5.146 6.709 9.645 5.768 15.852-.766 5.003-.144 6.878 2.362 7.125 1.866.183 4.204-.327 5.193-1.133 2.521-2.074 30.429-.782 30.253 1.396-.079.981-6.478 1.293-14.225.686-7.738-.606-16.65.272-19.793 1.939-7.077 3.766-9.462 1.205-7.237-7.771zm57.77 71.373c.367-.295 2.011.231 3.67 1.181 1.652.941 2.282 2.305 1.388 3.039-.885.726-2.537.192-3.662-1.18-1.124-1.381-1.755-2.745-1.396-3.04zm237.63 283.081c2.545-2.346 5.305-2.497 9.127-.503 4.803 2.513 4.898 2.737.79 1.827-2.577-.574-5.872-.064-7.324 1.117-4.237 3.479-6.59 1.261-2.593-2.441zM239.595 355.102c1.883-1.316 3.534-1.548 3.678-.511.135 1.03-1.205 2.362-2.976 2.944-4.46 1.476-4.771.415-.702-2.433zm13.682 10.348c4.42-3.622 14.058-4.013 16.116-.654 2.809 4.571-3.239 12.294-6.502 8.305-1.181-1.444-2.896-2.003-3.813-1.253-.918.75-2.897-.135-4.404-1.97-1.5-1.835-2.131-3.83-1.397-4.428zM136.756 220.016c-.981-2.114-1.611-6.494-1.404-9.733.335-5.306.71-5.713 3.702-4.006 1.827 1.046 4.292 1.101 5.473.136 3.63-2.968 8.186 1.364 9.135 8.688.606 4.731-.343 7.643-2.976 9.056-4.268 2.297-10.443 2.784-11.48.901-.359-.662-1.468-2.928-2.45-5.042zm187.822 222.511c.367-3.646 4.691-5.386 6.845-2.745 1.819 2.21 2.362 1.955 3.024-1.42.654-3.375 1.189-3.654 2.936-1.524 2.824 3.447 1.412 7.077-3.518 9.04-4.205 1.675-9.59-.272-9.287-3.351zM187.649 272.145c-.479-1.524-.096-3.399.846-4.172.933-.766 2.194.071 2.784 1.866.622 1.883 1.803 2.394 2.785 1.205.973-1.181 3.366-.159 5.624 2.394 4.747 5.385 3.207 7.164-4.356 5.042-5.968-1.676-6.319-1.963-7.683-6.335zm20.919 21.198c.973-.798 2.385-.694 3.135.224.75.917 1.037 1.938.63 2.273-.406.327-1.811.232-3.135-.223-1.316-.455-1.596-1.476-.63-2.274zm11.44 14.281c-2.018-5.154.256-7.292 7.045-6.614 7.109.702 13.044 8.329 9.047 11.608-2.728 2.234-12.932 2.306-14.009.104-.224-.463-1.165-2.752-2.083-5.098zm7.66 3.534c.406-.335.119-1.356-.631-2.273-.75-.918-2.162-1.014-3.135-.224-.974.798-.686 1.819.63 2.274 1.316.455 2.729.55 3.136.223zm123.406 152.615a2.145 2.145 0 0 1 3.031.303 2.16 2.16 0 0 1-.303 3.031 2.16 2.16 0 0 1-3.032-.303 2.146 2.146 0 0 1 .304-3.031zM116.165 173.886c.917-.75 2.752-.997 4.069-.542 1.316.454 1.643 1.444.726 2.194-.918.75-2.745.989-4.061.542-1.325-.455-1.652-1.444-.734-2.194zm59.692 72.266c.479-1.404 1.732-2.473 2.785-2.369 3.207.319 6.749 4.428 5.034 5.84-.894.726-.543 1.699.774 2.146 1.316.455 1.228 1.787-.2 2.96-3.119 2.545-5.441-1.061-4.499-6.997.598-3.75.415-3.869-1.492-.965-2.41 3.678-3.766 3.335-2.402-.615zm218.307 268.745c.399-.336 1.811-.232 3.127.223 1.324.447 1.604 1.476.638 2.266-.973.798-2.385.702-3.135-.216-.75-.925-1.037-1.946-.63-2.273zm-85.223-112.74c-.734-6.925-.638-7.045 3.893-5.162 6.271 2.601 8.377 5.513 8.553 11.808.12 4.46-.072 4.699-1.245 1.508-.997-2.737-1.843-2.96-3.071-.798-2.665 4.659-7.3.455-8.13-7.356zm42.212 53.127c.679-3.503 1.014-3.598 2.011-.591.654 1.979.519 4.149-.303 4.819-2.146 1.763-2.633.551-1.708-4.228zM219.442 292.809c.918-.758 1.939-1.038 2.274-.631.327.399.231 1.811-.224 3.128-.454 1.324-1.476 1.603-2.273.63-.79-.973-.694-2.377.223-3.127zm185.891 218.513c1.38-1.133 3.12-1.3 3.87-.383.757.918.239 2.593-1.133 3.718-1.381 1.125-3.12 1.301-3.87.383-.75-.917-.239-2.593 1.133-3.718zM284.791 357.296c1.165-.949 2.784-.072 3.75 2.042.941 2.043 1.508 3.878 1.26 4.077-.239.2-1.93-.718-3.749-2.042-1.875-1.364-2.418-3.128-1.261-4.077zm80.436 97.669c-.654-3.295-3.104-7.564-5.441-9.486-4.867-4.005-5.585-7.971-1.979-10.922 1.396-1.133 1.301-3.295-.199-4.851-1.484-1.54-1.588-3.199-.232-3.686 1.365-.487 4.053 1.364 5.976 4.117 2.29 3.263 5.282 4.866 8.656 4.611 5.529-.415 10.141 3.782 11.449 10.419.606 3.048-1.213 5.649-7.109 10.173-4.348 3.342-8.369 5.967-8.919 5.84-.551-.12-1.54-2.92-2.202-6.215zm12.605-9.574c.551-3.072.351-6.351-.43-7.284-.79-.934-1.237.024-.998 2.13.232 2.106-.207 3.095-.989 2.202-.782-.894-1.221.096-.981 2.202.71 6.335 2.337 6.694 3.398.75zm-78.369-72.825c.495-4.962 3.423-6.638 3.391-1.938-.016 3.263.462 3.318 2.672.271 2.298-3.16 3.335-2.936 6.957 1.492 2.705 3.303 3.423 5.888 1.963 7.084-4.468 3.654-15.526-1.444-14.983-6.909zm115.699 133.738c3.303-2.417 10.906-3.997 8.337-1.731-1.332 1.173-4.148 2.329-6.255 2.569-2.106.239-3.039-.144-2.082-.838zM293.551 354.775c.351-.295 2.266.654 4.245 2.098 1.986 1.444 2.584 2.761 1.332 2.928-2.186.287-6.893-3.949-5.577-5.026zm86.372 102.096c.343-.287 2.736-.047 5.313.527 4.237.949 4.229 1.053-.12 1.149-4.563.096-6.566-.551-5.193-1.676zm-48.053-64.487c-1.125-7.013 3.12-8.178 10.843-2.968 7.323 4.939 14.847 16.076 12.286 18.174-1.923 1.572-8.999-1.683-10.029-4.611-.462-1.308-2.776-2.393-5.138-2.409-4.962-.032-6.996-2.123-7.962-8.186zm9.694 5.305c1.38-.183 1.898-1.085 1.141-2.002-.75-.918-2.498-1.516-3.878-1.332-1.38.183-1.899 1.085-1.149 2.002.758.918 2.497 1.516 3.886 1.332zm8.8 3.942c.454-1.317.55-2.729.223-3.136-.335-.399-1.356-.119-2.274.631-.917.749-1.013 2.162-.223 3.135.798.973 1.819.686 2.274-.63zm45.252 27.756c-.383-2.37.056-4.931.981-5.681 2.322-1.907 15.653 5.489 16.946 9.414.925 2.777.095 3.383-6.08 4.436-7.475 1.269-10.69-.941-11.847-8.169zm36.181 24.03c4.787 1.54 6.59 3.75 3.414 4.172-1.388.184-3.542-.941-4.803-2.505-1.962-2.449-1.779-2.68 1.389-1.667z',
									fill: '#b44b1b',
								}),
								yt.createElement('path', {
									d: 'M112.567 321.937c.032-3.766-1.412-7.914-3.208-9.223-1.787-1.3-2.233-2.505-.981-2.673 4.149-.558.957-2.034-5.242-2.433-5.329-.343-6.191-1.069-6.789-5.728-.423-3.287.606-5.737 2.673-6.359 1.843-.55 5.281-2.417 7.643-4.133 3.016-2.201 5.569-2.146 8.624.2 3.112 2.377 6.08 2.401 10.468.096 14.887-7.835 25.338 1.683 15.326 13.945-5.593 6.846 1.843 14.848 10.954 11.8 10.403-3.478 19.091 15.159 8.951 19.196-2.242.893-5.672.462-7.619-.958-1.955-1.412-4.46-1.827-5.577-.917-2.05 1.683 10.699 16.028 19.499 21.948 2.25 1.508 3.797 4.412 3.622 6.789-.168 2.282 1.364 6.239 3.391 8.792 2.928 3.678 4.451 4.013 7.371 1.628 2.027-1.66 3.295-4.269 2.817-5.793-.479-1.523.79-.997 2.816 1.181l3.678 3.957-2.09-5.975c-1.149-3.287-1.053-6.112.215-6.279 3.032-.407 9.023 7.013 8.018 9.933-1.962 5.712 21.86 12.517 25.307 7.228 3.183-4.883 7.826-2.617 6.342 3.111-.678 2.617-1.938 4.851-2.792 4.963-3.303.439 6.287 7.683 10.763 8.13 4.268.422 4.683.981 4.332 5.84-.463 6.59-.423 15.126.111 19.083.503 3.774 12.494 9.024 17.864 7.811 5.752-1.293 11.033-9.207 8.847-13.252-1.013-1.867-4.26-4.164-7.228-5.114-2.96-.949-5.832-2.92-6.382-4.396-1.205-3.231 4.81-8.624 6.853-6.135.79.965 1.787.766 2.202-.447.782-2.266 14.6.543 16.977 3.439 1.963 2.401-5.313 6.957-9.047 5.672-1.994-.686-.901 1.444 2.84 5.513 3.343 3.646 7.635 6.79 9.534 6.973 4.827.487 7.037 3.766 4.979 7.388-.974 1.691-4.516 2.776-7.979 2.433-3.446-.343-7.012.734-7.97 2.418-1.771 3.103 4.811 10.898 20.6 24.421 7.914 6.773 6.023 11.026-6.399 14.36-10.188 2.745-13.419.926-22.283-12.509-4.045-6.135-8.855-11.074-12.892-13.236-5.394-2.888-6.263-4.013-5.37-6.941.742-2.409-.032-2.058-2.489 1.133-2.72 3.526-4.89 4.252-9.135 3.055-6.781-1.898-8.489-6.183-6.59-16.506 1.388-7.548-1.883-15.478-5.241-12.725-.894.726-2.162-.32-2.825-2.33-.766-2.314-1.531-2.697-2.098-1.061-1.755 5.114-8.074 5.265-10.435.255-1.253-2.673-2.984-4.149-3.942-3.367-.933.766-.773 2.521.351 3.894 1.125 1.38 1.349 3.079.495 3.781-2.122 1.732-7.89-2.265-12.238-8.48-1.971-2.833-7.34-7.779-11.928-10.994-7.005-4.915-9.214-7.747-13.77-17.664l-5.433-11.816-6.933.136c-5.361.104-6.694-.598-5.864-3.096.702-2.122.391-2.696-.902-1.667-2.241 1.787-8.8-11.066-8.815-17.265-.008-4.053-9.861-6.51-13.651-3.406-3.59 2.944-12.39-9.63-12.326-17.624zm-9.199-17.704a2.162 2.162 0 0 0 .295-3.039 2.162 2.162 0 0 0-3.032-.304 2.171 2.171 0 0 0-.303 3.04 2.17 2.17 0 0 0 3.04.303zm21.03 14.465c-1.659-8.353-1.292-9.989 2.37-10.404 4.97-.566 5.409-1.803 2.497-6.997-1.364-2.441-4.133-3.295-8.034-2.481-5.385 1.117-5.984 1.939-6.215 8.577-.192 5.201 1.428 9.358 5.537 14.273l5.808 6.941-1.963-9.909zm61.6 73.965c1.531-1.252 1.882-2.361.781-2.473-1.101-.112-1.986-1.891-1.97-3.965.016-2.067-.551-3.287-1.245-2.713-1.069.87-1.563 9.486-.638 10.97.16.256 1.54-.566 3.072-1.819zm-55.313-80.683c.096-.933-1.596-1.109-3.75-.391-3.119 1.045-3.159 1.388-.175 1.7 2.066.215 3.837-.375 3.925-1.309zm83.156 87.13c2.833-.79 5.561-.144 6.088 1.436.526 1.579 1.316 1.803 1.763.502 1.189-3.446-5.912-11.345-11.489-12.789-3.047-.79-5.513.016-6.757 2.194-2.745 4.811 4.021 10.444 10.395 8.657zm46.322 38.749a2.17 2.17 0 0 0 .303-3.039 2.16 2.16 0 0 0-3.032-.303 2.17 2.17 0 0 0-.303 3.039 2.16 2.16 0 0 0 3.032.303zM46.029 237.44c-2.896-9.231 1.428-34.777 7.276-42.978 3.008-4.221 6.231-8.768 7.156-10.116 1.269-1.843-.024-2.825-5.186-3.974-8.76-1.938-9.749-5.169-4.403-14.408 4.77-8.266 15.397-19.587 11.488-12.239-1.213 2.274-4.691 7.596-7.731 11.84-6.159 8.592-4.372 13.906 4.308 12.789 6.814-.878 6.926 2.457.383 11.584-7.786 10.874-13.251 32.503-10.81 42.803 1.141 4.795 1.508 9.191.83 9.765-1.436 1.213-1.245 1.5-3.311-5.066zm25.929 26.735c.127-5.202-1.468-10.3-4.316-13.778-10.739-13.124-10.611-34.761.311-54.986 3.773-6.981 14.887-14.975 17.089-12.278.71.862 1.628.582 2.05-.622 2.322-6.758 31.65-2.49 33.947 4.93.575 1.851.2 1.995-1.188.487-2.577-2.801-13.555-3.176-16.738-.567-1.333 1.093-1.301 2.641.063 3.431 10.125 5.864 10.779 6.917 8.505 13.643-1.253 3.709-2.401 7.26-2.561 7.89-.159.622 4.005 1.173 9.255 1.229l9.542.087 1.531 14.872-5.217-4.221c-5.792-4.683-19.291-7.763-22.507-5.13-1.133.926-3.015 1.085-4.188.343-1.189-.75-3.439 4.221-5.114 11.289-2.083 8.784-4.261 13.132-7.157 14.281-4.922 1.963-6.677 8.473-3.358 12.526 2.792 3.407 11.959 4.236 15.429 1.388 5.513-4.515 9.494-1.659 11.194 8.034 1.3 7.364.654 10.14-3.056 13.18-2.585 2.114-5.313 3.096-6.063 2.178a2.161 2.161 0 0 0-3.032-.303c-.918.75-.726 2.521.431 3.933 1.683 2.059 1.332 2.521-1.795 2.314-2.146-.136-4.979-2.25-6.311-4.691-1.324-2.442-5.138-5.298-8.473-6.351-7.962-2.505-8.505-3.367-8.273-13.108zm13.818 9.861c1.428-1.173 1.516-2.505.199-2.952-1.316-.455-3.103-.247-3.965.455-.861.71-.957 2.042-.207 2.96.75.917 2.537.71 3.973-.463zm11.233-.319c-.502-1.596-1.739-2.992-2.752-3.088-1.005-.103-.591 1.205.917 2.904 1.676 1.883 2.394 1.955 1.835.184zm-14.863-51.922c3.494-3.949 6.414-14.752 4.994-18.469-1.619-4.261-12.382 8.648-12.063 14.48.335 6.039 3.614 7.89 7.069 3.989zm27.413-19.722c.223-2.258-.606-1.939-2.792 1.061-1.772 2.433-1.907 3.814-.32 3.207 1.532-.59 2.936-2.505 3.112-4.268zm104.219 216.663c1.077-3.136 6.071-.806 5.728 2.673-.192 1.938-1.364 2.361-3.375 1.212-1.699-.965-2.752-2.712-2.353-3.885zM98.262 240.097c1.125-3.263 8.241-5.928 11.241-4.205 4.428 2.545 6.087 11.409 2.505 13.348-1.867 1.005-4.101.965-4.962-.096-.87-1.053-2.601-2.018-3.854-2.146-3.239-.327-5.904-4.053-4.93-6.901zm91.98 104.705c5.002-3.119 5.912-5.241 2.976-6.917-2.625-1.5-2.21-1.986 2.8-3.311 8.409-2.226 11.967.631 8.8 7.061-2.098 4.268-3.335 5.202-5.784 4.356-2.226-.766-3.008-.263-2.745 1.755.208 1.548-.67 2.96-1.962 3.136-3.471.462-6.758-4.42-4.085-6.08zM56.959 171.437c6.183-3.351 12.55-2.529 11.177 1.452-.526 1.54-4.324 2.425-8.552 2.01l-7.603-.758 4.978-2.704zm94.717 116.944c.502-1.452 2.545-2.625 4.547-2.609 2.003.016 3.798-1.037 3.989-2.33.2-1.3.583-.973.862.71.279 1.692-.622 3.989-1.995 5.122-1.436 1.173-1.348 2.442.208 2.976 1.643.567 1.547 1.372-.248 2.058-3.733 1.429-8.552-2.449-7.363-5.927zm159.172 195.082c-2.896-4.404-3.056-6.558-.638-8.537 1.779-1.452 3.845-1.891 4.595-.973 2.29 2.784 8.529-3.87 8.257-8.808-.175-3.247-1.508-5.154-4.436-6.367-6.318-2.625-4.786-4.38 3.256-3.742 7.667.615 12.278 3.064 9.717 5.162-.862.71.909 3.471 3.925 6.136 4.612 4.076 5.05 5.473 2.737 8.656-3.048 4.188.255 9.901 6.047 10.483 2.003.2 3.064.838 2.354 1.412-.702.583.766 1.261 3.271 1.508 5.888.59 8.504-1.683 9.486-8.209.662-4.396 1.803-5.537 6.821-6.87 5.792-1.531 5.984-1.396 4.835 3.367-.654 2.729-2.035 5.681-3.056 6.566-2.577 2.234 2.434 12.183 6.327 12.574 1.747.175 6.43-2.083 10.411-5.018 4.716-3.471 6-5.17 3.702-4.875-4.787.614-5.856-7.236-1.627-11.904 2.369-2.608 4.236-2.505 7.97.439 8.465 6.686 9.51 7.037 12.813 4.332 2.082-1.707 2.393-4.914.877-9.055-1.651-4.507-1.332-6.749 1.062-7.539 2.217-.734 2.64-2.074 1.22-3.814-2.593-3.167-3.446-2.672-6.007 3.495-1.524 3.686-2.091 3.997-2.737 1.547-.447-1.699-1.428-4.786-2.17-6.853-1.46-4.021 1.612-7.882 5.266-6.622 1.212.415 6.462 5.8 11.672 11.96l9.454 11.209-.032-6.47c-.024-3.559-.854-7.468-1.859-8.689-.997-1.22-1.428-3.342-.957-4.715 1.18-3.422 6.326 7.723 5.832 12.638-.208 2.074-.136 4.587.159 5.576 1.731 5.88-4.906 19.435-13.427 27.421-8.393 7.867-10.491 8.792-23.352 10.3-7.763.918-16.978.766-20.472-.335-3.494-1.101-10.292-2.393-15.103-2.872-6.35-.63-9.222-2.066-10.483-5.234-1.803-4.531-19.626-11.632-22.754-9.071-2.553 2.09-8.768-1.851-12.956-8.209zm-188.46-239.409c4.539-3.718 4.763-3.67 6.462 1.452 1.995 6.032-5.648 8.058-10.068 2.665-.312-.383 1.308-2.234 3.606-4.117zm50.454 57.937c2.952-5.177 11.712-11.552 12.079-8.791.183 1.38 1.14 1.85 2.114 1.053 2.417-1.979 3.454 6.502 1.5 12.27-1.213 3.574-2.673 4.228-7.851 3.526-7.635-1.037-10.292-3.757-7.842-8.058zM64.155 158.967c1.229-2.042 2.553-4.484 2.936-5.417.383-.934 1.309-.958 2.051-.048 1.571 1.923-2.944 9.606-5.489 9.35-.95-.087-.718-1.843.502-3.885zm11.959 4.3c1.181-4.755.415-8.576-2.505-12.422-3.997-5.265-3.853-9.773.184-5.672 5.074 5.146 6.709 9.645 5.768 15.852-.766 5.003-.144 6.878 2.362 7.125 1.866.183 4.204-.327 5.193-1.133 2.521-2.074 30.429-.782 30.253 1.396-.079.981-6.478 1.293-14.225.686-7.738-.606-16.65.272-19.793 1.939-7.077 3.766-9.462 1.205-7.237-7.771zm223.923 275.39c2.625-2.146 4.061-1.827 5.984 1.349 3.75 6.191-1.436 11.249-5.92 5.776-2.641-3.231-2.657-5.003-.064-7.125zm-44.446-70.383c-1.013-1.931-.63-3.814.854-4.181s4.444-1.3 6.574-2.082c5.553-2.018 9.542 5.529 5.337 10.1-2.17 2.354-4.029 2.745-5.353 1.125-1.117-1.364-2.824-2.241-3.798-1.962-.965.287-2.593-1.061-3.614-3zm139.602 151.928c12.143-2.657 17.344-5.13 29.288-13.906l14.528-10.667 2.816 4.987c1.556 2.744 3.271 6.55 3.806 8.449.542 1.898 3.279 4.052 6.079 4.778 5.026 1.301 5.114 1.213 6.095-6.254.551-4.165.216-8.521-.742-9.686-.957-1.173-.478-4.803 1.054-8.082 3.486-7.451.255-11.863-5.904-8.058-7.915 4.883-9.542 2.944-10.101-12.063-.303-7.986-1.276-15.421-2.162-16.522-.893-1.093-1.252-3.064-.805-4.38 1.324-3.846 4.156 6.589 5.377 19.833 1.141 12.271 2.305 15.901 3.75 11.696 1.404-4.069 9.063-5.928 11.608-2.816 1.324 1.611 2.074 5.617 1.675 8.896-1.252 10.275-1.34 11.839-1.013 19.426.359 8.441-2.705 11.896-10.22 11.521-4.787-.24-5.329-.822-6.702-7.308-2.281-10.779-5.64-11.337-15.988-2.657-4.938 4.141-11.145 8.505-13.786 9.694-7.484 3.358-31.243 8.911-32.392 7.563-.566-.662 5.609-2.657 13.739-4.444zm-258.508-300.33c-2.968-6.342-.726-11.624 5.648-13.307 7.611-2.003 12.326 5.576 8.505 13.698-2.226 4.739-3.734 6.048-6.909 6.032-2.226-.016-4.356-.575-4.723-1.237-.359-.662-1.5-2.992-2.521-5.186zm50.964 52.273c-.479-1.524-.199-3.319.614-3.981.814-.662 2.019.431 2.681 2.441.814 2.45 1.524 2.729 2.178.846.527-1.548 1.556-2.282 2.282-1.635 9.406 8.393 9.382 11.321-.072 8.664-5.968-1.676-6.319-1.963-7.683-6.335zm140.966 169.129c1.332-1.093 3-1.26 3.718-.383.718.878 1.699-.407 2.17-2.848.75-3.861 1.141-3.949 2.912-.662 2.737 5.066-1.604 9.853-6.933 7.643-3.279-1.364-3.718-2.234-1.867-3.75zM219.434 306.746c-2.17-4.962-2.09-5.074 2.441-3.39 3.335 1.244 4.117 1.013 2.705-.822-1.755-2.282-1.564-2.433 1.691-1.388 5.521 1.779 11.609 10.012 8.992 12.15-2.099 1.724-12.271 1.277-13.172-.574-.224-.463-1.42-3.151-2.657-5.976zm8.234 4.412c.406-.335.119-1.356-.631-2.273-.75-.918-2.162-1.014-3.135-.224-.974.798-.686 1.819.63 2.274 1.316.455 2.729.55 3.136.223zm-47.526-62.708c.422-1.229 1.867-1.859 3.207-1.396 1.34.463 1.595 1.524.566 2.369-1.021.838-.782 1.899.535 2.346 1.316.455 1.603 1.476.63 2.274-2.178 1.787-5.991-2.529-4.938-5.593zm128.99 151.928c1.62-8.353 11.984-1.221 12.255 8.425.12 4.46-.072 4.699-1.245 1.508-1.037-2.84-1.835-2.976-3.223-.543-2.497 4.38-8.951-3.406-7.787-9.39zm-8.863-26.735c2.593-4.46 8.034-4.635 12.422-.399 4.827 4.668 2.274 8.657-4.675 7.308-3.295-.638-4.117-1.659-4.093-5.066.024-3.574-.279-3.734-1.851-.973-1.037 1.811-2.186 2.912-2.561 2.457-.375-.463-.032-1.954.758-3.327zm65.333 80.5c-.359-2.282-2.896-6.478-5.625-9.327-4.228-4.404-4.428-5.592-1.308-7.986 2.864-2.202 2.872-3.606.016-6.398-2.154-2.114-2.665-3.925-1.245-4.436 1.325-.479 3.989 1.388 5.912 4.141 2.29 3.263 5.282 4.866 8.656 4.611 5.457-.415 10.795 4.516 11.553 10.667.279 2.329-2.346 6.031-7.109 9.996-7.675 6.399-9.661 6.168-10.85-1.268zm11.337-5.29c-.471-1.523.199-3.646 1.5-4.707 1.3-1.061 1.276-3.239-.056-4.835-2.058-2.481-2.354-2.345-1.979.926.232 2.106-.207 3.095-.989 2.202-.782-.894-1.221.096-.981 2.202.231 2.106 1.093 4.539 1.898 5.409.814.87 1.086.335.607-1.197zm-82.654-93.934c1.013.103 2.25 1.491 2.753 3.095.558 1.763-.16 1.691-1.835-.183-1.508-1.7-1.923-3.008-.918-2.912zm37.601 37.569c-.375-2.314.734-4.676 2.449-5.25 4.357-1.436 15.773 6.231 17.959 12.071.998 2.657 2.418 5.274 3.168 5.816.742.535.63 1.572-.256 2.298-2.082 1.707-9.151-1.364-10.236-4.444-.462-1.308-2.776-2.393-5.138-2.409-4.938-.032-6.996-2.123-7.946-8.082zm9.678 5.201c1.38-.183 1.898-1.085 1.141-2.002-.75-.918-2.498-1.516-3.878-1.332-1.38.183-1.899 1.085-1.149 2.002.758.918 2.497 1.516 3.886 1.332zm8.8 3.942c.454-1.317.55-2.729.223-3.136-.335-.399-1.356-.119-2.274.631-.917.749-1.013 2.162-.223 3.135.798.973 1.819.686 2.274-.63zm95.698 100.038c-.766-2.442-1.947-4.651-2.625-4.923-.678-.263.207-1.659 1.978-3.111 3.862-3.16 5.314-1.883 4.221 3.71-.439 2.265.048 5.161 1.085 6.422 1.037 1.269 1.133 2.912.215 3.67-1.938 1.58-2.952.383-4.874-5.768zm-50.263-71.74c-.933-7.826 12.614-5.226 15.318 2.936.838 2.545-.072 3.447-4.763 4.683-6.039 1.604-9.781-1.101-10.555-7.619z',
									fill: '#a73b22',
								}),
								yt.createElement('path', {
									d: 'M117.569 332.604c1.476-.2 2.29-1.612 1.811-3.144-.622-1.994-.367-2.258.894-.909 2.537 2.712.718 6.51-2.585 5.377-1.676-.574-1.724-1.109-.12-1.324zm-19.594-28.147c1.388-.184 3.127.415 3.885 1.34.75.918.231 1.819-1.149 2.003-1.38.183-3.127-.415-3.877-1.333-.758-.925-.24-1.827 1.141-2.01zm-51.396-65.23c-4.236-12.589.678-38 9.199-47.581l5.082-5.705-4.22 6.829c-6.502 10.532-10.635 29.368-8.768 39.995.933 5.282 1.364 9.869.965 10.196-.407.327-.822.359-.941.064-.112-.287-.71-1.995-1.317-3.798zm67.703 80.045c-.104-2.824-1.285-5.505-2.609-5.96-1.372-.47-1.157-.997.495-1.22 1.851-.248 3.223 1.069 3.765 3.614.471 2.202 1.971 4.667 3.319 5.481 1.572.941 1.205 1.891-1.013 2.625-1.915.63-3.542 1.021-3.614.869-.08-.159-.231-2.593-.343-5.409zm34.705 42.372c1.372-1.125 3.494-.83 4.715.662 1.819 2.218 1.46 2.705-1.987 2.681-2.313-.016-4.435-.311-4.715-.662-.287-.343.607-1.548 1.987-2.681zM71.838 265.93c.862-.702 2.649-.917 3.973-.463 1.317.455 1.548 1.516.511 2.37-1.181.965-.303 2.569 2.377 4.324 9.582 6.303 9.821 6.582 4.54 5.505-5.728-1.165-13.962-9.638-11.401-11.736zm24.693 29.958a2.17 2.17 0 0 1 3.039.303 2.16 2.16 0 0 1-.303 3.032 2.172 2.172 0 0 1-3.04-.303 2.16 2.16 0 0 1 .304-3.032zm7.084 4.077c-.255-4.707-.112-4.803 3.479-2.186 2.864 2.082 2.96 3.279.399 5.066-1.835 1.293-3.407 2.274-3.479 2.186-.072-.088-.247-2.369-.399-5.066zm22.746 27.245c1.38-1.125 3.095-1.324 3.829-.43.726.885-.159 2.106-1.97 2.704-1.803.599-3.527.79-3.822.431-.295-.359.591-1.58 1.963-2.705zm14.017 20.034c-.446-1.46.575-3.112 2.274-3.678 2.649-.878 3.032-.415 2.665 3.239-.678 6.845-2.896 7.044-4.939.439zm25.427 27.572c.112-1.109 1.412-2.976 2.888-4.133 2.202-1.739 2.401-1.356 1.085 2.147-1.612 4.332-4.34 5.688-3.973 1.986zm-93.6-119.034c.479-1.396-.399-3.566-1.962-4.835-1.556-1.26-2.498-4.236-2.091-6.614.662-3.829.503-3.949-1.42-1.013-2.665 4.069-4.252 2.417-4.42-4.595-.072-2.92.327-4.428.886-3.351 2.393 4.643 9.757 6.901 17.528 5.393 4.595-.893 8.903-.965 9.566-.159 1.077 1.316-.168 1.954-9.056 4.659-1.372.423-1.906 4.539-1.196 9.159 1.18 7.667 1.667 8.377 5.616 8.161 3.495-.191 3.343.008-.79 1.053-3.151.798-5.52.048-6.183-1.962-.598-1.787-1.914-2.569-2.928-1.739-2.345 1.922-4.691-.83-3.55-4.157zm2.234-7.308c.447-1.316.551-2.729.215-3.135-.327-.399-1.348-.12-2.265.63-.918.758-1.022 2.162-.224 3.135.798.974 1.819.686 2.274-.63zm8.329 19.746c1.532-1.301 3.79-2.019 5.018-1.596 1.237.423 4.38-1.643 6.989-4.595 3.239-3.67 6.072-5.106 8.96-4.548 3.654.71 3.446 1.389-1.556 5.066-3.782 2.785-5.05 4.843-3.67 5.968 1.165.95 1.356 2.338.439 3.096a2.16 2.16 0 0 1-3.032-.304c-.75-.917-2.617-.646-4.148.607-1.532 1.252-2.689 1.388-2.585.303.111-1.093-1.915-1.899-4.492-1.803-4.356.151-4.492-.008-1.923-2.194zm28.61 35.024c1.292-1.061 3.774-.439 5.505 1.38 1.731 1.819 2.76 3.176 2.274 3.016-.487-.16-2.96-.782-5.505-1.38-3.894-.918-4.253-1.396-2.274-3.016zm24.293 30.907c1.085-.47 2.218-4.499 2.514-8.951.55-8.353 2.792-13.132 2.744-5.856-.016 2.242 1.284 4.532 2.88 5.082 2.003.686 1.779 1.372-.742 2.21-4.723 1.564-1.962 4.978 3.782 4.667 3.965-.223 4.124.128 1.579 3.63-1.547 2.13-3.374 3.192-4.06 2.354-.679-.83-1.979-.591-2.881.534-.901 1.125-3.031.95-4.715-.391-1.691-1.34-2.186-2.816-1.101-3.279zm49.92 60.786c1.324.407 4.675.447 7.443.08 3.774-.495 4.117-.295 1.365.822-2.936 1.188-2.833 2.576.542 7.012 2.306 3.048 4.747 6.024 5.417 6.622.67.599.503 1.684-.383 2.41-.885.718-5.018-2.968-9.198-8.194-4.173-5.226-6.511-9.159-5.186-8.752zm-60.403-80.707c1.125-.918.806-2.098-.718-2.625-1.787-.614-1.659-1.101.351-1.364 2.218-.295 3.024.518 2.792 2.832-.175 1.787-1.252 3.151-2.393 3.04-1.141-.112-1.157-.958-.032-1.883zm5.649 6.526c-.264-2.298.223-3.04 1.22-1.859.91 1.085 1.285 3.048.83 4.364-1.021 2.976-1.5 2.402-2.05-2.505zM159 353.451c1.372-1.125 3.095-1.325 3.821-.431.726.885-.152 2.106-1.963 2.704-1.811.599-3.534.79-3.829.431-.295-.359.59-1.58 1.971-2.704zm31.098 36.109c2.274-2.003 5.8-3.471 7.851-3.263 2.928.287 4.077-.71 5.441-4.739 1.532-4.508 1.875-4.676 2.952-1.421.67 2.027 1.907 4.524 2.744 5.553 1.125 1.373.631 1.779-1.874 1.524-4.684-.463-7.101 4.532-4.013 8.305 1.755 2.147 1.467 3.455-.934 4.253-1.907.63-3.223.175-2.912-1.006.303-1.188.511-4.26.455-6.821-.096-4.125-.886-4.316-6.973-1.699-6.111 2.617-6.415 2.545-2.737-.686zm-80.467-96.967c.375-3.766 2.968-4.316 5.552-1.165 1.405 1.724 5.186 2.888 8.386 2.585 3.199-.303 5.72.607 5.6 2.019-.112 1.412-2.361 2.01-4.994 1.324-2.808-.726-5.194-.024-5.784 1.692-.623 1.803-1.149 1.882-1.373.199-.199-1.5-1.515-2.577-2.92-2.386-2.936.391-4.755-1.348-4.467-4.268zm73.51 85.725c2.362-1.89 2.593-1.699 1.58 1.349-1.013 3.047-.646 3.383 2.593 2.313 4.891-1.619 6.454.344 2.705 3.407-1.859 1.524-4.141 1.085-6.279-1.229-2.234-2.401-2.434-4.364-.599-5.84zm30.637 40.418c1.077-3.136 6.071-.806 5.728 2.673-.192 1.938-1.364 2.361-3.375 1.212-1.699-.965-2.752-2.712-2.353-3.885zM98.645 274.642c.925-.75 1.946-1.037 2.274-.63.335.407.231 1.811-.224 3.135-.447 1.317-1.476 1.604-2.266.631-.797-.974-.702-2.386.216-3.136zm-33.947-48.268c1.444-1.986 3.183-2.928 3.861-2.098.686.838-.263 2.745-2.098 4.245-1.835 1.507-3.574 2.449-3.862 2.098-.287-.351.655-2.266 2.099-4.245zm142.178 174.77c1.78-.957 4.237-1.101 5.481-.319 1.429.909.734 2.122-1.922 3.335-4.947 2.274-8.218-.503-3.559-3.016zm27.342 35.662a2.152 2.152 0 0 1 3.031.304 2.152 2.152 0 0 1-.303 3.031 2.16 2.16 0 0 1-3.032-.303 2.16 2.16 0 0 1 .304-3.032zM60.461 216.944c3.439-5.951 5.394-5.592 3.87.718-1.452 6.032-3.12 7.851-5.05 5.497-.774-.941-.24-3.741 1.18-6.215zm12.757 13.021c.447-1.317 1.963-1.006 3.359.702 1.396 1.707 4.157 3.263 6.135 3.462 1.971.192 3.495 1.301 3.383 2.458-.239 2.409-9.486.654-12.023-2.282-.925-1.069-1.308-3.024-.854-4.34zm32.104 39.212c.918-.75 1.939-1.037 2.274-.63.327.407.232 1.811-.223 3.135-.455 1.317-1.476 1.596-2.274.631-.79-.974-.694-2.386.223-3.136zm26.759 32.447c-1.117-3.486-.909-3.853.982-1.731 1.316 1.476 3.829 3.503 5.576 4.5 1.739.989 2.418 2.417 1.5 3.175-2.473 2.019-6.454-.917-8.058-5.944zm-27.022-37.593c1.7-1.507 3.008-1.922 2.912-.909-.103 1.005-1.492 2.242-3.087 2.744-1.771.559-1.7-.159.175-1.835zm122.864 151.968c-.942-2.944 2.002-1.843 11.169 4.197 6.853 4.515 12.143 9.111 11.76 10.228-.383 1.109-1.819.67-3.191-.981-2.122-2.546-2.434-2.418-2.091.853.296 2.761-.494 2.17-2.824-2.114-2.218-4.093-4.739-6.111-8.058-6.438-2.656-.264-4.978-.766-5.154-1.117-.175-.343-.901-2.426-1.611-4.628zm21.333 22.427c2.147-1.755 4.436-1.771 5.992-.024 1.388 1.548 3.798 3.877 5.361 5.17 1.556 1.3 2.083 3.686 1.165 5.297-1.3 2.274-2.401 1.676-4.938-2.648-1.915-3.279-3.854-4.843-4.691-3.806-.782.981-2.538 1.125-3.894.319-1.476-.869-1.077-2.601 1.005-4.308zm-96.535-119.872c.949-1.651 2.25-2.361 2.896-1.572.646.79.407 2.793-.543 4.444-.941 1.66-2.242 2.37-2.888 1.572-.646-.79-.407-2.784.535-4.444zm9.909 13.802c1.396-.183 1.124-2.058-.615-4.212-2.449-3.032-2.361-3.614.423-2.689 2.25.742 3.542 2.497 3.526 4.771-.031 4.364-2.417 6.654-4.403 4.229-.79-.966-.312-1.915 1.069-2.099zM73.442 220.024c-.264-2.298.223-3.04 1.22-1.859.91 1.077 1.277 3.04.822 4.364-1.021 2.976-1.492 2.393-2.042-2.505zm119.552 146.008c-1.252-4.348-1.188-4.388 1.811-.949 1.708 1.954 2.737 4.635 2.282 5.951-.973 2.841-2.305 1.205-4.093-5.002zm72.155 89.292c1.38.758 3.255 2.983 4.157 4.954.909 1.971-.224 1.356-2.514-1.372-2.281-2.721-3.023-4.332-1.643-3.582zm13.164 13.204c1.372-1.125 3.016-1.429 3.638-.663.63.766.016 2.314-1.364 3.439-1.373 1.133-3.016 1.428-3.638.662-.631-.766-.016-2.314 1.364-3.438zM82.457 221.683c4.085-3.853 4.26-3.797 3.135.918-.662 2.752-2.162 5.13-3.342 5.281-4.157.559-4.069-2.17.207-6.199zm132.318 166.592c1.46.152 4.156 2.641 5.983 5.545 3.064 4.867 2.857 4.843-2.656-.263-3.439-3.176-4.859-5.433-3.327-5.282zm59.828 71.963c1.005.104 2.242 1.492 2.752 3.088.559 1.771-.167 1.699-1.834-.176-1.516-1.699-1.923-3.008-.918-2.912zM70.929 206.748c.973-2.832 5.305-3.742 7.14-1.5.702.862-.223 2.801-2.058 4.301-3.519 2.888-6.479 1.252-5.082-2.801zm19.012 16.603c1.563-5.745 2.632-7.197 4.037-5.473 2.058 2.513-1.668 13.73-4.468 13.451-.934-.088-.742-3.678.431-7.978zm8.385 16.562c.494-1.436 2.545-2.377 4.563-2.098 2.8.399 2.944.638.606 1.045-1.874.327-2.225 1.532-.917 3.136 2.92 3.558 7.276-.455 5.266-4.843-.902-1.955.383-1.269 2.84 1.524 3.359 3.797 3.821 5.975 1.859 8.672-1.947 2.673-3.303 2.784-5.234.423-1.428-1.747-3.351-2.561-4.268-1.811-2.242 1.835-5.84-2.777-4.715-6.048zm113.082 140.304c.407-.335 1.819-.231 3.135.224 1.317.454 1.604 1.476.631 2.265-.974.798-2.378.703-3.136-.215-.75-.917-1.029-1.947-.63-2.274zM47.601 175.466c-.104-1.396 1.324-5.298 3.167-8.664 2.665-4.883 3.063-5.202 1.962-1.556-3.981 13.212-4.18 12.581 3.902 12.821 7.148.207 10.068 2.872 6.43 5.856-.917.75-1.811.311-1.978-.974-.176-1.284-1.46-2.186-2.857-2.002-4.092.55-10.427-2.721-10.626-5.481zm231.31 281.884c1.388-.183 3.096.367 3.798 1.237.71.861.534 2.178-.383 2.936-.918.75-2.625.191-3.798-1.237-1.173-1.436-.997-2.752.383-2.936zm8.992 5.872c2.696-2.202 5.002-2.481 6.51-.798 1.795 2.011 2.034 1.564 1.045-1.899-1.061-3.678-.854-4.005 1.125-1.787 3.271 3.678 1.891 6.814-4.268 9.718-6.59 3.103-9.861-.766-4.412-5.234zm-96.815-116.537c-.351-3.079.191-3.079 2.752.008 1.771 2.13 2.066 3.973.662 4.165-3.023.399-2.88.574-3.414-4.173zm40.361 47.789c.399-.335 1.811-.231 3.128.224 1.324.446 1.603 1.476.638 2.265-.973.798-2.386.703-3.136-.215-.75-.925-1.037-1.947-.63-2.274zm33.588 29.759c5.681-6.518 9.199-8.824 10.045-6.59.287.734 3.079 1.468 6.207 1.619 3.135.16 6.566 1.349 7.627 2.649 2.577 3.144-5.258 7.819-9.055 5.393-2.458-1.571-2.202-1.827 1.779-1.811 3.941.016 4.364-.335 2.768-2.265-1.037-1.253-5.122-1.732-9.071-1.062-6.231 1.07-7.188 1.764-7.212 5.274-.024 3.295.327 3.439 1.851.75 2.72-4.755 3.821-2.202 2.664 6.175-1.156 8.385.375 10.85 9.024 14.552 3.422 1.46 5.146 2.801 3.821 2.976-1.324.184-1.348 1.723-.056 3.439 2.099 2.784 1.907 2.88-1.811.949-5.744-2.976-14.664-13.786-13.698-16.595.51-1.475-1.029-3.35-4.268-5.209-2.785-1.604-5.274-3.168-5.537-3.487-.256-.319 1.954-3.359 4.922-6.757zM55.938 172.075c2.449-1.117 4.986-1.372 5.656-.558.662.805 2.481.423 4.045-.854 2.082-1.707 2.745-1.428 2.497 1.069-.247 2.497-2.489 3.255-8.488 2.888-7.404-.455-7.747-.686-3.71-2.545zm14.456 18.805c.926-1.62 2.489-2.665 3.471-2.33.989.343.438 1.915-1.221 3.502-3.598 3.423-4.58 2.912-2.25-1.172zM88.8 209.644c1.946-3.941 1.691-6.223-.91-8.249-1.978-1.54-4.196-4.819-4.938-7.284-1.109-3.71-.559-3.566 3.223.853 2.505 2.928 5.226 4.779 6.047 4.109.814-.67 2.92-.407 4.668.591 2.034 1.156 2.202 2.154.47 2.76-1.492.527-4.34 3.941-6.326 7.595-4.277 7.843-6.12 7.532-2.234-.375zm-11.609-12.845c1.764.176 3.678 1.572 4.269 3.104.606 1.588-.774 1.452-3.207-.319-3-2.186-3.319-3.016-1.062-2.785zm119.593 137.568c5.226-1.38 5.593-1.165 3.71 2.202-3.12 5.577-3.447 5.696-6.598 2.385-2.577-2.712-2.258-3.223 2.888-4.587zm29.671 41.893a2.161 2.161 0 0 1 3.032.303 2.153 2.153 0 0 1-.296 3.032 2.162 2.162 0 0 1-3.039-.295 2.17 2.17 0 0 1 .303-3.04zm90.177 110.131c.917-.75 2.936.183 4.484 2.074 1.547 1.883 1.683 3.582.295 3.766-1.38.183-3.399-.742-4.476-2.067-1.085-1.324-1.221-3.023-.303-3.773zm-5.96-10.22c.575-1.676 1.867-2.96 2.872-2.857 2.713.272 1.851 3.694-1.228 4.875-2.162.822-2.481.423-1.644-2.018zm5.058 2.824c1.038-2.505 3.367-5.768 5.162-7.236 1.795-1.476 2.777-4.157 2.178-5.968-.598-1.811-.119-4.069 1.069-5.018 1.436-1.149 1.899-.822 1.373.965-.431 1.484-.232 4.292.438 6.239.742 2.13-1.053 5.936-4.499 9.566-6.861 7.204-8.258 7.563-5.721 1.452zM158.593 285.022c1.34-1.093 2.553-1.045 2.712.104.152 1.156-.431 2.672-1.292 3.382-.862.71-2.083.663-2.713-.103-.622-.766-.04-2.29 1.293-3.383zm14.64 17.775c.837-4.308 6.526-7.388 8.712-4.723.702.862-.543 2.402-2.769 3.423-4.507 2.066-3.478 4.731 2.043 5.281 1.978.192 3.494 1.301 3.382 2.458-.199 1.962-9.23.885-11.249-1.341-.502-.558-.558-2.848-.119-5.098zM57.868 155.417c4.859-3.973 5.824-3.965 3.551.024-.846 1.484-2.968 2.88-4.715 3.119-2.035.271-1.612-.862 1.164-3.143zm42.253 57.554c-.862-2.776 4.683-5.696 6.534-3.446.582.71-.12 2.92-1.564 4.898-2.649 3.638-3.478 3.399-4.97-1.452zm-19.339-28.227c.454-1.324 1.476-1.603 2.273-.638.798.974.695 2.386-.223 3.136-.917.75-1.939 1.037-2.266.63-.335-.399-.231-1.811.216-3.128zm183.202 222.112c1.181-.973 3.774-.582 5.76.862 2.226 1.62 2.785 3.295 1.452 4.38-1.18.973-3.773.582-5.76-.862-2.226-1.619-2.784-3.295-1.452-4.38zM113.636 214.383c5.393-.933 9.007-.263 10.204 1.891 1.093 1.979 2.21 2.298 2.728.782 1.42-4.141 1.875-1.875.822 4.061-.949 5.321-1.085 5.313-4.093-.335-2.154-4.061-3.598-5.186-4.723-3.694-.893 1.181-4.252 1.388-7.459.447l-5.84-1.708 8.361-1.444zm214.357 264.604c-.208-3.957.399-3.798 4.683 1.213 5.138 5.999 4.803 9.015-.654 5.903-4.029-2.297-3.75-1.803-4.029-7.116zM76.481 162.27c1.261-5.752.559-9.35-2.577-13.22-3.071-3.789-3.326-4.994-.885-4.18 4.571 1.515 7.619 10.826 5.992 18.309-1.093 5.019-.719 5.848 2.513 5.481 3.007-.335 2.975.152-.168 2.354-5.329 3.734-6.973.79-4.875-8.744zm27.07 40.066c.455-1.324 1.476-1.603 2.274-.63s.694 2.378-.223 3.127c-.918.758-1.939 1.038-2.274.631-.327-.399-.231-1.811.223-3.128zM300.085 443.5c1.396.766 2.936 2.641 3.415 4.173.471 1.523-.67.893-2.553-1.397-1.875-2.297-2.266-3.542-.862-2.776zm40.457 46.728c-.279-5.002 2.546-6.239 6.455-2.832 1.109.965 3.622 2.633 5.577 3.71 2.409 1.324 2.792 2.601 1.172 3.925-1.316 1.077-3.414.598-4.659-1.069-1.237-1.668-3.008-2.418-3.925-1.66-.918.75-1.021 1.772-.224 2.274 1.971 1.245.447 2.282-2.074 1.412-1.125-.391-2.17-2.976-2.322-5.76zM98.062 194.286c.359-.295 2.059.264 3.766 1.245 1.787 1.013 2.058 1.915.63 2.106-2.385.319-5.752-2.242-4.396-3.351zm10.962 9.486c2.872-5.042 4.348-5.457 2.577-.718-.877 2.346-2.234 4.205-3.015 4.125-.782-.08-.591-1.612.438-3.407zM92.446 182.16c.861-.703 2.633-.918 3.941-.471 1.356.471.917 1.3-1.037 1.946-3.798 1.253-5.306.495-2.904-1.475zm181.607 220.061c.502-3.064 1.252-3.534 3.558-2.218 1.603.918 2.633 1.899 2.274 2.194-.351.287-1.46 1.955-2.45 3.702-2.21 3.877-4.268 1.643-3.382-3.678zm27.588 35.12c.894-.726 2.545-.2 3.67 1.181 1.125 1.38 1.755 2.744 1.396 3.039-.367.296-2.01-.231-3.67-1.18-1.651-.942-2.282-2.314-1.396-3.04zm15.151 17.169c4.268-1.412 9.382 1.771 6.558 4.085-1.253 1.021-3.702 1.045-5.45.048-4.499-2.569-4.611-2.976-1.108-4.133zM102.147 185.582c1.7-1.508 3.008-1.923 2.912-.917-.104 1.013-1.492 2.25-3.095 2.752-1.764.559-1.692-.159.183-1.835zm-14.648-18.884c2.083-1.699 30.038-.343 29.878 1.46-.079.838-7.148 1.117-15.717.614-8.568-.502-14.943-1.436-14.161-2.074zm248.472 302.468c.455-1.325 1.787-1.229 2.96.199 1.165 1.428 1.372 3.215.455 3.965-.918.758-2.242.663-2.952-.199-.71-.862-.918-2.649-.463-3.965zm58.201 51.794c11.696-2.034 16.044-4.037 28.282-13.028 12.502-9.191 14.959-10.292 18.206-8.186 2.059 1.348 3.622 3.718 3.463 5.274-.176 1.747-1.42 1.332-3.263-1.093-2.8-3.686-3.814-3.335-16.722 5.792-10.3 7.276-17.249 10.523-27.701 12.924-7.675 1.764-14.432 2.649-15.014 1.963-.591-.678 5.153-2.322 12.749-3.646zM255.184 363.886c2.793-2.29 5.912.104 4.149 3.191-1.037 1.819-2.497 2.035-3.71.551-1.109-1.349-1.3-3.032-.439-3.742zm101.107 123.486c.862-.71 2.649-.918 3.966-.463 1.324.455 1.228 1.779-.2 2.952-1.436 1.173-3.215 1.38-3.973.463-.75-.918-.654-2.25.207-2.952zm10.93 11.409c.407-2.952 1.293-3.184 4.173-1.093 3.008 2.194 4.691 1.643 9.582-3.112 5.84-5.688 6.326-5.648 10.427.974 1.109 1.787.766 2.09-1.5 1.34-1.619-.527-6.207 1.348-10.212 4.18-3.997 2.825-7.395 4.165-7.555 2.976-.16-1.188-1.452-2.018-2.864-1.835-1.66.208-2.386-1.005-2.051-3.43zm-257.957-318.76c2.72.272 5.329 1.524 5.792 2.777.463 1.252-1.763 1.029-4.947-.495-5.353-2.561-5.417-2.736-.845-2.282zm27.07 31.706c.47-3.16 1.348-5.154 1.946-4.42.599.726.646 3.462.096 6.071-.902 4.324-.702 4.34 2.258.2l3.247-4.54-.295 6.861c-.168 3.774.933 7.595 2.441 8.489 1.675 1.005 1.636 1.779-.104 2.01-4.603.615-10.523-8.448-9.589-14.671zm130.578 159.276c.973-.79.527-1.875-.997-2.394-1.843-.638-1.652-1.101.558-1.396 2.505-.335 2.378-.989-.502-2.641-2.761-1.588-2.912-2.114-.527-1.883 4.149.391 6.494 6.989 3.399 9.526-1.285 1.053-2.633 1.532-3.008 1.069-.383-.454.112-1.484 1.077-2.281zm112.053 134.033c2.051-1.676 3.862-2.011 4.037-.75.168 1.26 1.404 1.874 2.761 1.364 1.348-.519 2.912.263 3.47 1.739.678 1.771-1.508 2.338-6.486 1.683l-7.508-.981 3.726-3.055zm-50.023-63.179c1.811-.599 3.918-.328 4.675.606.806.973-.39 1.683-2.816 1.667-2.306-.016-4.412-.295-4.675-.606-.255-.319 1.005-1.069 2.816-1.667zM194.646 272.895c-1.412-3.997-1.316-4.085 2.234-2.058 2.034 1.165 3.574 3.367 3.422 4.898-.39 3.918-3.909 2.154-5.656-2.84zm31.681 39.364c.918-.758 3.527-1.005 5.792-.566 2.306.447 3.391 1.404 2.458 2.17-.918.75-3.527 1.005-5.793.558-2.305-.446-3.39-1.404-2.457-2.162zm135.046 162.587c.631-.518 3.383-1.38 6.112-1.923 3.989-.781 4.747-.311 3.853 2.378-1.3 3.925-4.22 6.829-3.925 3.917.104-1.101-1.468-2.321-3.495-2.712-2.034-.399-3.175-1.141-2.545-1.66zM148.093 209.07c-.375-3.295-.111-3.439 1.899-1.029 1.293 1.539 1.971 3.885 1.516 5.201-1.045 3.032-2.848.822-3.415-4.172zm32.104 39.212c1.046-3.031 2.857-.821 3.423 4.173.367 3.295.104 3.439-1.907 1.029-1.284-1.54-1.962-3.885-1.516-5.202zm214.23 249.525c.806-6.143 1.229-6.749 2.346-3.382 1.172 3.542 1.89 3.47 5.273-.583 2.705-3.231 5.681-4.507 9.63-4.109 6.654.663 8.233-.103 5.257-2.545-1.986-1.635 3.447-6.239 6.989-5.927 5.346.47-10.332 23.32-16.562 24.15-1.437.199-3.343-1.46-4.221-3.678-1.133-2.841-2.401-3.367-4.316-1.803-1.492 1.22-1.747 2.553-.567 2.959 1.181.407 1.373 2.091.431 3.734-2.736 4.803-5.337-.59-4.26-8.816zm16.291-2.042c.918-.75 1.014-2.162.224-3.135-.798-.974-1.819-.687-2.274.63-.455 1.324-.551 2.728-.223 3.135.335.407 1.356.12 2.273-.63zm-100.445-98.937c1.444-1.189 9.351 3.167 9.159 5.05-.056.59-2.457-.048-5.337-1.42-2.872-1.364-4.596-3-3.822-3.63zm57.563 60.179c.455-1.316 1.476-1.596 2.274-.63.789.973.694 2.385-.224 3.135-.917.75-1.939 1.037-2.274.63-.327-.406-.231-1.811.224-3.135zm18.214 17.145c1.38-1.125 2.744-1.755 3.04-1.396.295.359-.232 2.01-1.181 3.67-.942 1.651-2.314 2.282-3.04 1.388-.726-.885-.191-2.537 1.181-3.662zm-17.775-25.969c3.446-1.436 4.108-2.633 2.529-4.563-1.173-1.444-1.277-3.327-.216-4.197 1.093-.893-.558-1.954-3.821-2.441-7.667-1.157-5.41-2.689 3.566-2.425 8.042.239 12.613 4.651 12.917 12.453.167 4.404-.152 4.803-2.027 2.522-1.229-1.5-1.859-3.798-1.404-5.122 1.101-3.192-4.005-9.263-6.247-7.428-.973.798-.463 1.947 1.141 2.553 1.596.606 1.779 1.045.407.973-1.372-.072-2.09 1.979-1.588 4.564.838 4.292.447 4.715-4.507 4.882-5.322.184-5.33.152-.75-1.771zm25.785 32.336c1.125-1.971 2.29-3.439 2.593-3.271.303.175 4.005 1.683 8.233 3.35 7.492 2.96 7.572 3.064 3.255 3.982-2.425.518-5.082 2.042-5.895 3.398-.806 1.349-2.171 1.596-3.032.551-.854-1.053-.431-2.059.949-2.242 4.213-.567.91-2.689-3.765-2.433-4.021.223-4.213-.048-2.338-3.335zm-84.09-108.527c.718-.591 2.537.431 4.037 2.266 1.508 1.835 2.146 3.821 1.428 4.412-.726.59-2.545-.431-4.045-2.266-1.508-1.835-2.146-3.822-1.42-4.412zm46.449 53.948c.886-.726 2.537-.199 3.662 1.181 1.133 1.372 1.755 2.744 1.396 3.04-.359.295-2.01-.24-3.662-1.181-1.659-.942-2.282-2.314-1.396-3.04zm-24.732-36.867c.462-1.364 1.292-.917 1.938 1.029 1.261 3.798.495 5.306-1.468 2.912-.71-.869-.917-2.641-.47-3.941zm9.877 9.095c2.999-1.372 3.39-2.976 1.571-6.382-1.635-3.056-1.029-2.729 1.851 1.005 4.524 5.856 3.024 9.247-3.51 7.978-3.199-.622-3.183-1.101.088-2.601zm6.773 6.51c.351-.279 2.737-.04 5.314.535 4.244.941 4.228 1.053-.112 1.141-4.564.095-6.574-.551-5.202-1.676zm63.259 65.98c3.486 2.545 8.84-.463 6.319-3.551-.878-1.069-.79-1.866.199-1.771.989.104 2.553 2.098 3.487 4.436 1.595 4.005 1.372 4.244-3.838 4.125-3.048-.064-6.39-1.341-7.428-2.824-1.412-2.019-1.093-2.123 1.261-.415zm35.455 42.108c7.092 3.902 12.214 1.157 11.369-6.095-.399-3.399-.128-10.659.59-16.14 1.492-11.321-3.087-16.698-8.146-9.582-2.409 3.391-2.68 3.407-1.579.088 3.335-9.98 13.595-5.489 12.27 5.37-1.252 10.275-1.34 11.839-1.013 19.426.175 4.077-1.101 8.577-2.84 9.997-3.2 2.625-10.508.838-13.587-3.327-.934-1.252.391-1.133 2.936.263zm-43.178-55.998c.918-.75 1.939-1.037 2.274-.631.327.407.231 1.819-.224 3.136-.454 1.316-1.475 1.603-2.273.63-.79-.973-.694-2.385.223-3.135zm22.706 14.113c1.173-6.582 3.726-4.699 3.032 2.242-.527 5.281-1.365 6.598-2.968 4.643-.583-.71-.615-3.813-.064-6.885zm19.562 25.347c.686-6.941 2.474-7.396 2.131-.551-.16 3.191-.543 6.024-.862 6.279-1.237 1.013-1.723-1.173-1.269-5.728zm-45.659-62.988c1.101-1.923 1.891-2.473 1.772-1.221-.128 1.253 2.114 1.819 4.97 1.253 3.399-.67 4.875-.08 4.26 1.699-.51 1.5-1.619 1.883-2.457.854-.846-1.021-1.859-.909-2.258.263-.407 1.165-2.433 1.795-4.507 1.389-2.92-.567-3.327-1.524-1.78-4.237zm42.117 47.566c1.779-1.452-.846-25.347-3.127-28.49-1.309-1.803-1.101-2.035.853-.965 1.412.781 3.208 7.722 3.981 15.429 1.444 14.401.894 20.041-1.643 16.93-.798-.973-.83-2.274-.064-2.904zm-42.452-55.823c1.381-.184 3.128.415 3.878 1.332.75.918.231 1.819-1.149 2.003-1.38.183-3.128-.415-3.878-1.333-.75-.917-.239-1.819 1.149-2.002z',
									fill: '#a53a1b',
								}),
							),
							yt.createElement(
								'g',
								null,
								yt.createElement('path', {
									d: 'M274.384 148.543c0 49.444-40.687 90.131-90.131 90.131-49.445 0-90.131-40.687-90.131-90.131 0-49.445 40.686-90.131 90.131-90.131 49.444 0 90.131 40.686 90.131 90.131z',
									fill: 'url(#_Radial27)',
								}),
								yt.createElement('path', {
									d: 'M274.384 148.543c0 49.444-40.687 90.131-90.131 90.131-49.445 0-90.131-40.687-90.131-90.131 0-49.445 40.686-90.131 90.131-90.131 49.444 0 90.131 40.686 90.131 90.131z',
									fill: 'url(#_Radial28)',
									stroke: '#00be31',
									strokeWidth: 8.19,
								}),
								yt.createElement('path', {
									d: 'M235.866 93.522c-30.559 8.222-57.764 32.816-63.083 64.823-12.862-8.54-23.65-26.069-39.223-26.931-10.28 5.352-34.192 19.223-14.029 27.34 18.04 14.02 45.066 26.646 49.359 51.001 8.815 8.235 20.209-3.471 29.392-6.554 11.384-18.427-1.403-43.814 9.627-63.391 5.696-18.463 25.627-25.934 36.969-39.324-.01-4.86-4.46-8.226-9.012-6.964z',
									fill: '#fff',
								}),
							),
						)),
					Jo ||
						(Jo = yt.createElement(
							'defs',
							null,
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial1',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(640.51 0 0 634.043 547.006 216.093)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.02, stopColor: '#fdf7e2' }),
								yt.createElement('stop', { offset: 0.09, stopColor: '#f8e18c' }),
								yt.createElement('stop', { offset: 0.13, stopColor: '#f6d86a' }),
								yt.createElement('stop', { offset: 0.37, stopColor: '#f3cb5a' }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#c47313' }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#ac4a15' }),
								yt.createElement('stop', { offset: 1, stopColor: '#ac4a15' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial2',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-310.92 0 0 312.388 560.826 -45.945)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a' }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643' }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21' }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b' }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111' }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial3',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-448.056 0 0 450.172 535.92 35.73)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a' }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643' }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21' }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b' }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111' }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial4',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(550.091 13.183) scale(257.072)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a' }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643' }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21' }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b' }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111' }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial5',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-754.244 0 0 754.244 295.945 119.644)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#646464' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial6',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-537.897 0 0 537.897 339.69 58.273)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#646464' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial7',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-730.574 0 0 730.574 488.8 -19.372)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#646464' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial8',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-862.083 0 0 862.083 292.182 90.84)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#646464' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial9',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(105.426 53.6608 -53.9788 104.813 466.228 104.894)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.05, stopColor: '#fccdcc' }),
								yt.createElement('stop', { offset: 0.17, stopColor: '#f65954' }),
								yt.createElement('stop', { offset: 0.22, stopColor: '#f32b24' }),
								yt.createElement('stop', { offset: 0.52, stopColor: '#db2313' }),
								yt.createElement('stop', { offset: 0.77, stopColor: '#c8140d' }),
								yt.createElement('stop', { offset: 0.98, stopColor: '#aa0e0b' }),
								yt.createElement('stop', { offset: 1, stopColor: '#aa0e0b' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial10',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(187.858 95.6181 -96.1846 186.767 430.089 74.81)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.29 }),
								yt.createElement('stop', { offset: 0.05, stopColor: '#fccdcc', stopOpacity: 0.29 }),
								yt.createElement('stop', { offset: 0.17, stopColor: '#f65954', stopOpacity: 0.29 }),
								yt.createElement('stop', { offset: 0.22, stopColor: '#f32b24', stopOpacity: 0.29 }),
								yt.createElement('stop', { offset: 0.52, stopColor: '#db2313', stopOpacity: 0.29 }),
								yt.createElement('stop', { offset: 0.77, stopColor: '#c8140d', stopOpacity: 0.29 }),
								yt.createElement('stop', { offset: 0.98, stopColor: '#aa0e0b', stopOpacity: 0.29 }),
								yt.createElement('stop', { offset: 1, stopColor: '#aa0e0b', stopOpacity: 0.29 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial11',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(42.765 21.767 -21.896 42.5166 441.602 81.601)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.05, stopColor: '#fccdcc' }),
								yt.createElement('stop', { offset: 0.17, stopColor: '#f65954' }),
								yt.createElement('stop', { offset: 0.22, stopColor: '#f32b24' }),
								yt.createElement('stop', { offset: 0.52, stopColor: '#db2313' }),
								yt.createElement('stop', { offset: 0.77, stopColor: '#c8140d' }),
								yt.createElement('stop', { offset: 0.98, stopColor: '#aa0e0b' }),
								yt.createElement('stop', { offset: 1, stopColor: '#aa0e0b' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial12',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(345.723 175.97 -177.013 343.715 455.898 130.423)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.21 }),
								yt.createElement('stop', { offset: 0.05, stopColor: '#fccdcc', stopOpacity: 0.21 }),
								yt.createElement('stop', { offset: 0.17, stopColor: '#f65954', stopOpacity: 0.21 }),
								yt.createElement('stop', { offset: 0.22, stopColor: '#f32b24', stopOpacity: 0.21 }),
								yt.createElement('stop', { offset: 0.52, stopColor: '#db2313', stopOpacity: 0.21 }),
								yt.createElement('stop', { offset: 0.77, stopColor: '#c8140d', stopOpacity: 0.21 }),
								yt.createElement('stop', { offset: 0.98, stopColor: '#aa0e0b', stopOpacity: 0.21 }),
								yt.createElement('stop', { offset: 1, stopColor: '#aa0e0b', stopOpacity: 0.21 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial13',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(168.242 85.6336 -86.1409 167.264 384.511 33.889)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.34 }),
								yt.createElement('stop', { offset: 0.05, stopColor: '#fccdcc', stopOpacity: 0.34 }),
								yt.createElement('stop', { offset: 0.17, stopColor: '#f65954', stopOpacity: 0.34 }),
								yt.createElement('stop', { offset: 0.22, stopColor: '#f32b24', stopOpacity: 0.34 }),
								yt.createElement('stop', { offset: 0.52, stopColor: '#db2313', stopOpacity: 0.34 }),
								yt.createElement('stop', { offset: 0.77, stopColor: '#c8140d', stopOpacity: 0.34 }),
								yt.createElement('stop', { offset: 0.98, stopColor: '#aa0e0b', stopOpacity: 0.34 }),
								yt.createElement('stop', { offset: 1, stopColor: '#aa0e0b', stopOpacity: 0.34 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial14',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(139.866 71.1905 -71.6123 139.054 395.292 78.575)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.19 }),
								yt.createElement('stop', { offset: 0.05, stopColor: '#fccdcc', stopOpacity: 0.19 }),
								yt.createElement('stop', { offset: 0.17, stopColor: '#f65954', stopOpacity: 0.19 }),
								yt.createElement('stop', { offset: 0.22, stopColor: '#f32b24', stopOpacity: 0.19 }),
								yt.createElement('stop', { offset: 0.52, stopColor: '#db2313', stopOpacity: 0.19 }),
								yt.createElement('stop', { offset: 0.77, stopColor: '#c8140d', stopOpacity: 0.19 }),
								yt.createElement('stop', { offset: 0.98, stopColor: '#aa0e0b', stopOpacity: 0.19 }),
								yt.createElement('stop', { offset: 1, stopColor: '#aa0e0b', stopOpacity: 0.19 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial15',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(259.526 132.096 -132.879 258.019 390.011 83.36)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.73 }),
								yt.createElement('stop', { offset: 0.05, stopColor: '#fccdcc', stopOpacity: 0.73 }),
								yt.createElement('stop', { offset: 0.17, stopColor: '#f65954', stopOpacity: 0.73 }),
								yt.createElement('stop', { offset: 0.22, stopColor: '#f32b24', stopOpacity: 0.73 }),
								yt.createElement('stop', { offset: 0.52, stopColor: '#db2313', stopOpacity: 0.73 }),
								yt.createElement('stop', { offset: 0.77, stopColor: '#c8140d', stopOpacity: 0.73 }),
								yt.createElement('stop', { offset: 0.98, stopColor: '#aa0e0b', stopOpacity: 0.73 }),
								yt.createElement('stop', { offset: 1, stopColor: '#aa0e0b', stopOpacity: 0.73 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial16',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-664.317 0 0 664.317 345.993 -3.099)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#646464' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial17',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-491.537 0 0 491.537 371.017 34.474)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#646464' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial18',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-1392.51 0 0 1392.51 328.495 44.503)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#646464' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial19',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(-524.901 0 0 518.113 639.29 227.354)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.02, stopColor: '#fdf7e2' }),
								yt.createElement('stop', { offset: 0.09, stopColor: '#f8e18c' }),
								yt.createElement('stop', { offset: 0.13, stopColor: '#f6d86a' }),
								yt.createElement('stop', { offset: 0.37, stopColor: '#f3cb5a' }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#c47313' }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#ac4a15' }),
								yt.createElement('stop', { offset: 1, stopColor: '#ac4a15' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial20',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(485.234 0 0 543.355 570.755 248.021)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111', stopOpacity: 0.49 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial21',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(513.448 323.171) scale(229.103)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111', stopOpacity: 0.49 }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111', stopOpacity: 0.49 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial22',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(550.617 371.77) scale(138.339)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.51 }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a', stopOpacity: 0.51 }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643', stopOpacity: 0.51 }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21', stopOpacity: 0.51 }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b', stopOpacity: 0.51 }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111', stopOpacity: 0.51 }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111', stopOpacity: 0.51 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial23',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(549.95 207.128) scale(1149.14)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.16 }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a', stopOpacity: 0.16 }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643', stopOpacity: 0.16 }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21', stopOpacity: 0.16 }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b', stopOpacity: 0.16 }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111', stopOpacity: 0.16 }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111', stopOpacity: 0.16 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial24',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(487.859 345.024) scale(260.6)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.5 }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a', stopOpacity: 0.5 }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643', stopOpacity: 0.5 }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21', stopOpacity: 0.5 }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b', stopOpacity: 0.5 }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111', stopOpacity: 0.5 }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111', stopOpacity: 0.5 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial25',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(425.468 386.042) scale(203.712)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a' }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643' }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21' }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b' }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111' }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111' }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial26',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(575.105 255.163) scale(189.422)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff', stopOpacity: 0.33 }),
								yt.createElement('stop', { offset: 0.15, stopColor: '#cfad9a', stopOpacity: 0.33 }),
								yt.createElement('stop', { offset: 0.28, stopColor: '#a56643', stopOpacity: 0.33 }),
								yt.createElement('stop', { offset: 0.35, stopColor: '#954a21', stopOpacity: 0.33 }),
								yt.createElement('stop', { offset: 0.65, stopColor: '#541c0b', stopOpacity: 0.33 }),
								yt.createElement('stop', { offset: 0.99, stopColor: '#361111', stopOpacity: 0.33 }),
								yt.createElement('stop', { offset: 1, stopColor: '#361111', stopOpacity: 0.33 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial27',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'translate(146.118 107.432) scale(90.1295)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#fff' }),
								yt.createElement('stop', { offset: 1, stopColor: '#00f038', stopOpacity: 0 }),
							),
							yt.createElement(
								'radialGradient',
								{
									id: '_Radial28',
									cx: 0,
									cy: 0,
									r: 1,
									gradientUnits: 'userSpaceOnUse',
									gradientTransform: 'matrix(82.8182 85.2012 -64.6291 62.8211 146.568 112.943)',
								},
								yt.createElement('stop', { offset: 0, stopColor: '#9bffb3' }),
								yt.createElement('stop', { offset: 1, stopColor: '#00f038' }),
							),
						)),
				);
			}
			var ic,
				lc,
				dc,
				pc = yt.forwardRef(rc),
				uc =
					(n.p,
					go()({
						palette: {
							primary1Color: '#6740b4',
							primary2Color: Ie.deepPurple400,
							primary3Color: Ie.deepPurple100,
							accent1Color: Ie.deepPurple500,
							accent2Color: Ie.deepPurple400,
							accent3Color: Ie.deepPurple300,
							textColor: Ie.fullBlack,
							alternateTextColor: Ie.white,
							canvasColor: Ie.white,
							borderColor: Ie.deepPurple100,
							disabledColor: Object(zo.fade)(Ie.fullBlack, 0.5),
							pickerHeaderColor: Ie.deepPurple300,
							clockCircleColor: Object(zo.fade)(Ie.yellow500, 0.07),
							shadowColor: Ie.fullBlack,
						},
						appBar: { height: 50 },
					})),
				mc = wt.a.div(
					ic ||
						(ic = Object(Ct.a)([
							'\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  width: 100%;\n',
						])),
				),
				jc = wt.a.div(
					lc ||
						(lc = Object(Ct.a)([
							'\n  text-align: center;\n\n  & > svg {\n    max-width: 70vw;\n    max-height: 60vh;\n  }\n',
						])),
				),
				fc = wt.a.h1(
					dc ||
						(dc = Object(Ct.a)(['\n  margin-top: 0px;\n  font-size: 38px;\n  font-size: 6vmin;\n  color: white;\n'])),
				),
				hc = 'small';
			function bc(e, t) {
				var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : hc;
				return e.greaterThan[n] && t.responsive;
			}
			var Oc,
				xc,
				gc,
				yc,
				vc,
				zc,
				Cc,
				wc,
				_c,
				Sc,
				Ec = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'componentDidMount',
								value: (function () {
									var e = Object(g.a)(
										x.a.mark(function e() {
											var t, n, a, o, c;
											return x.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	(t = this.props),
																	(n = t.getInitialAppState),
																	(a = t.params),
																	(o = t.setEmbedMapFromRoute),
																	(c = t.location),
																	(e.next = 3),
																	n(a.electionName)
																);
															case 3:
																!0 === new URLSearchParams(c.search).has('embed') && o(!0);
															case 4:
															case 'end':
																return e.stop();
														}
												},
												e,
												this,
											);
										}),
									);
									return function () {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'UNSAFE_componentWillReceiveProps',
								value: function (e) {
									if ('params' in e && 'electionName' in e.params && e.elections.length > 0)
										if (void 0 === e.params.electionName)
											void 0 !== e.defaultElection && e.setElectionFromRoute(e.defaultElection.id);
										else {
											var t = e.elections.find(function (t) {
												return D(t) === e.params.electionName;
											});
											void 0 !== t && e.setElectionFromRoute(t.id);
										}
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.app,
										n = e.snackbars,
										a = e.elections,
										o = e.liveElections,
										c = e.currentElection,
										s = e.browser,
										r = e.responsiveDrawer,
										i = e.handleSnackbarClose,
										l = e.onOpenDrawer,
										d = e.onClickDrawerLink,
										p = e.onClickOutboundDrawerLink,
										u = e.location,
										m = e.children,
										j = e.content;
									if (!0 === t.loading || 0 === a.length)
										return Object(Bt.jsx)(vo.a, {
											muiTheme: uc,
											children: Object(Bt.jsxs)('div', {
												style: { backgroundColor: uc.palette.primary1Color, width: '100%', height: '100%' },
												children: [
													Object(Bt.jsx)(Oo.a, { mode: 'indeterminate', color: uc.palette.accent3Color }),
													Object(Bt.jsx)(mc, {
														children: Object(Bt.jsxs)(jc, {
															children: [Object(Bt.jsx)(pc, {}), Object(Bt.jsx)(fc, { children: 'Democracy Sausage' })],
														}),
													}),
												],
											}),
										});
									var f = q(a, o, c),
										h = f.electionsToShow,
										b = f.isHistoricalElectionShown,
										O =
											'pageTitle' in j.type &&
											(!('muiName' in j.type) || 'ElectionChooserContainer' !== j.type.muiName) &&
											(!0 === b || (!1 === b && h.length > 1)),
										x = (function (e) {
											return (
												!window.location.pathname.startsWith('/search/') &&
												(!('muiName' in e.type) || 'SausageMapContainer' !== e.type.muiName)
											);
										})(j);
									return Object(Bt.jsx)(vo.a, {
										muiTheme: uc,
										children: Object(Bt.jsxs)(yt.Fragment, {
											children: [
												Object(Bt.jsxs)(zt.a, {
													children: [
														Object(Bt.jsx)('title', { children: 'Democracy Sausage' }),
														Object(Bt.jsx)('meta', { property: 'og:type', content: 'website' }),
														Object(Bt.jsx)('meta', {
															property: 'og:url',
															content: 'https://public-legacy.staging.democracysausage.org',
														}),
														Object(Bt.jsx)('meta', { property: 'og:title', content: 'Democracy Sausage' }),
														Object(Bt.jsx)('meta', {
															property: 'og:image',
															content: ''.concat(
																'https://public-legacy.staging.democracysausage.org/api',
																'/0.1/current_map_image/',
															),
														}),
														Object(Bt.jsx)('meta', {
															property: 'og:description',
															content:
																"A real-time crowd-sourced map of sausage and cake availability at Australian elections. It's practically part of the Australian Constitution. Or something. #demsausage",
														}),
														Object(Bt.jsx)('meta', { name: 'twitter:card', content: 'summary_large_image' }),
														Object(Bt.jsx)('meta', { name: 'twitter:site', content: '@DemSausage' }),
														Object(Bt.jsx)('meta', { name: 'twitter:creator', content: '@DemSausage' }),
													],
												}),
												Object(Bt.jsx)(oc, {
													muiThemePalette: uc.palette,
													app: t,
													snackbars: n,
													elections: a,
													currentElection: c,
													showElectionAppBar: O,
													showFooterNavBar: x,
													defaultBreakPoint: hc,
													isResponsiveAndOverBreakPoint: bc(s, r),
													handleSnackbarClose: i,
													onOpenDrawer: l,
													onClickDrawerLink: d,
													onClickOutboundDrawerLink: p,
													locationPathName: u.pathname,
													children: m,
													content: j,
												}),
											],
										}),
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				kc = Object(c.c)(
					function (e) {
						var t = e.app,
							n = e.snackbars,
							a = e.elections,
							o = e.browser,
							c = e.responsiveDrawer;
						return {
							app: t,
							snackbars: n,
							elections: a.elections,
							liveElections: A(e),
							currentElection: a.elections.find(function (e) {
								return e.id === a.current_election_id;
							}),
							defaultElection: a.elections.find(function (e) {
								return e.id === a.default_election_id;
							}),
							browser: o,
							responsiveDrawer: c,
						};
					},
					function (e) {
						return {
							getInitialAppState: function (t) {
								e(
									(function () {
										var e = Object(g.a)(
											x.a.mark(function e(t, n, a) {
												return x.a.wrap(function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	t({ type: Y }),
																	(e.next = 3),
																	Promise.all([
																		t(
																			(function () {
																				var e = Object(g.a)(
																					x.a.mark(function e(t, n, a) {
																						var o, c, s, r;
																						return x.a.wrap(function (e) {
																							for (;;)
																								switch ((e.prev = e.next)) {
																									case 0:
																										return (e.next = 2), a.get('/0.1/elections/public/', t);
																									case 2:
																										(o = e.sent),
																											(c = o.response),
																											(s = o.json),
																											200 === c.status &&
																												(t({ type: S, elections: s }),
																												(r = F(s)),
																												t(((n = r.id), { type: T, electionId: n })),
																												t(L(r.id)));
																									case 6:
																									case 'end':
																										return e.stop();
																								}
																							var n;
																						}, e);
																					}),
																				);
																				return function (t, n, a) {
																					return e.apply(this, arguments);
																				};
																			})(),
																		),
																	])
																);
															case 3:
																t({ type: K });
															case 4:
															case 'end':
																return e.stop();
														}
												}, e);
											}),
										);
										return function (t, n, a) {
											return e.apply(this, arguments);
										};
									})(),
								);
							},
							setElectionFromRoute: function (t) {
								e(L(t));
							},
							setEmbedMapFromRoute: function (t) {
								e({ type: te, embedded_map: t });
							},
							handleSnackbarClose: function (t) {
								'timeout' === t && e(Ue());
							},
							onOpenDrawer: function () {
								ca.event({ category: 'AppContainer', action: 'onOpenDrawer' }), e(Object(u.f)());
							},
							onClickDrawerLink: function (t) {
								e(Object(u.e)(!1));
							},
							onClickOutboundDrawerLink: function (e, t) {
								ca.event({ category: 'AppContainer', action: 'onOutboundLinkClick', label: t });
							},
						};
					},
				)(Ec),
				Tc = n(2368),
				Pc = n(709),
				Mc = n(399),
				Rc = n.n(Mc),
				Ac = function (e) {
					return e ? void 0 : 'Required';
				},
				Ic = function (e) {
					return e && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(e) ? 'Invalid email address' : void 0;
				},
				Lc = wt.a.div(Oc || (Oc = Object(Ct.a)(['\n  margin-top: 30px;\n  margin-bottom: 30px;\n']))),
				Fc = wt.a.h2(xc || (xc = Object(Ct.a)(['\n  margin-bottom: 0px;\n']))),
				Nc = Object(wt.a)(Rc.a)(gc || (gc = Object(Ct.a)(['\n  margin-bottom: 60px;\n']))),
				Dc = wt.a.button(yc || (yc = Object(Ct.a)(['\n  display: none;\n']))),
				Uc = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.formSubmitting,
										n = e.errors,
										a = this.props,
										o = a.isValid,
										c = a.onSaveForm,
										s = a.handleSubmit,
										r = a.onSubmit;
									return Object(Bt.jsxs)('form', {
										onSubmit: s(r),
										children: [
											Object(Bt.jsxs)(Lc, {
												style: { marginTop: 0 },
												children: [
													Object(Bt.jsx)(Fc, { children: 'Stall details' }),
													Object(Bt.jsx)(Ha, {
														name: 'name',
														component: Lt.TextField,
														floatingLabelText: 'What should we call your stall?',
														hintText: 'e.g. Smith Hill Primary School Sausage Sizzle',
														fullWidth: !0,
														validate: [Ac],
													}),
													Object(Bt.jsx)(Ha, {
														name: 'description',
														component: Lt.TextField,
														multiLine: !0,
														floatingLabelText: 'Describe your stall',
														hintText:
															"Who's running it and why you're running it e.g. The P&C is running the stall to raise funds for the Year 7 school camp",
														fullWidth: !0,
														validate: [Ac],
													}),
													Object(Bt.jsx)(Ha, {
														name: 'opening_hours',
														component: Lt.TextField,
														floatingLabelText: 'Stall opening hours (optional)',
														hintText: 'e.g. 8AM - 2PM',
														fullWidth: !0,
													}),
													Object(Bt.jsx)(Ha, {
														name: 'website',
														component: Lt.TextField,
														floatingLabelText: 'Stall website or social media page (optional)',
														hintText: "We'll include a link to your site as part of your stall's information",
														fullWidth: !0,
													}),
												],
											}),
											Object(Bt.jsxs)(Lc, {
												children: [
													Object(Bt.jsx)(Fc, { children: "What's on offer?" }),
													Object(Bt.jsxs)(Kn.List, {
														children: [
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Is there a sausage sizzle?',
																leftIcon: Object(Bt.jsx)(en, {}),
																rightToggle: Object(Bt.jsx)(qa, { name: 'bbq' }),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Is there a cake stall?',
																leftIcon: Object(Bt.jsx)(qt, {}),
																rightToggle: Object(Bt.jsx)(qa, { name: 'cake' }),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Are there savoury vegetarian options?',
																leftIcon: Object(Bt.jsx)(yn, {}),
																rightToggle: Object(Bt.jsx)(qa, { name: 'vego' }),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: "Is there any food that's halal?",
																leftIcon: Object(Bt.jsx)(Xt, {}),
																rightToggle: Object(Bt.jsx)(qa, { name: 'halal' }),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Do you have coffee?',
																leftIcon: Object(Bt.jsx)(Kt, {}),
																rightToggle: Object(Bt.jsx)(qa, { name: 'coffee' }),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Are there bacon and eggs?',
																leftIcon: Object(Bt.jsx)(Vt, {}),
																rightToggle: Object(Bt.jsx)(qa, { name: 'bacon_and_eggs' }),
															}),
														],
													}),
													Object(Bt.jsx)(Ha, {
														name: 'free_text',
														component: Lt.TextField,
														floatingLabelText: 'Anything else?',
														hintText: 'e.g. We also have cold drinks and pony rides!',
														fullWidth: !0,
													}),
												],
											}),
											Object(Bt.jsxs)(Lc, {
												children: [
													Object(Bt.jsx)(Fc, { children: 'Your details' }),
													Object(Bt.jsx)(Ha, {
														name: 'email',
														component: Lt.TextField,
														floatingLabelText: 'Contact email',
														hintText:
															"So we can contact you when we approve your stall (Don't worry - we won't spam you.)",
														fullWidth: !0,
														validate: [Ac, Ic],
														type: 'email',
													}),
												],
											}),
											Object(Bt.jsx)(Hn, { errors: n }),
											Object(Bt.jsx)(Nc, { label: 'Submit Stall Changes', disabled: !o || t, primary: !0, onClick: c }),
											Object(Bt.jsx)(Dc, { type: 'submit' }),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Gc = Object(It.a)({ form: 'editStall', enableReinitialize: !0, onChange: function (e, t, n) {} })(Uc),
				Bc = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a, o;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).initialValues = void 0),
							(a.state = { formSubmitting: !1, errors: void 0 }),
							(a.initialValues = Object(Tc.a)(
								((o = e.stall),
								Object(v.a)(
									Object(v.a)(
										{},
										(function (e) {
											if (null === e) return {};
											var t = {};
											return (
												[
													'bbq',
													'cake',
													'nothing',
													'run_out',
													'coffee',
													'vego',
													'halal',
													'bacon_and_eggs',
													'free_text',
												].forEach(function (n) {
													var a = e[n];
													'free_text' !== n ? !0 === a && (t[n] = a) : '' !== a && (t[n] = a);
												}),
												t
											);
										})(o.noms),
									),
									Object(Tc.a)(o),
								)),
							)),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'toggleFormSubmitting',
								value: function () {
									this.setState(
										Object(v.a)(Object(v.a)({}, this.state), {}, { formSubmitting: !this.state.formSubmitting }),
									);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props,
										n = t.isValid,
										a = t.onFormSubmit,
										o = t.onSaveForm,
										c = this.state,
										s = c.formSubmitting,
										r = c.errors;
									return Object(Bt.jsx)(Gc, {
										initialValues: this.initialValues,
										formSubmitting: s,
										errors: r,
										isValid: n,
										onSubmit: (function () {
											var t = Object(g.a)(
												x.a.mark(function t(n, o, c) {
													return x.a.wrap(function (t) {
														for (;;)
															switch ((t.prev = t.next)) {
																case 0:
																	return e.toggleFormSubmitting(), (t.next = 3), a(n, e);
																case 3:
																case 'end':
																	return t.stop();
															}
													}, t);
												}),
											);
											return function (e, n, a) {
												return t.apply(this, arguments);
											};
										})(),
										onSaveForm: function () {
											o();
										},
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				Wc = Object(c.c)(
					function (e, t) {
						return { isValid: Object(Pc.a)('editStall')(e) };
					},
					function (e) {
						return {
							onFormSubmit: function (t, n) {
								return Object(g.a)(
									x.a.mark(function a() {
										var o, c, s, r, i, l, d, p;
										return x.a.wrap(function (a) {
											for (;;)
												switch ((a.prev = a.next)) {
													case 0:
														return (
															(o = so(t)),
															(c = n.props),
															(s = c.stall),
															(r = c.credentials),
															(i = c.onStallUpdated),
															(a.next = 4),
															e(dt(s.id, o, r.token, r.signature))
														);
													case 4:
														(l = a.sent),
															(d = l.response),
															(p = l.json),
															200 === d.status
																? i()
																: 400 === d.status &&
																	n.setState(Object(v.a)(Object(v.a)({}, n.state), {}, { errors: p }), function () {
																		return n.toggleFormSubmitting();
																	});
													case 8:
													case 'end':
														return a.stop();
												}
										}, a);
									}),
								)();
							},
							onSaveForm: function () {
								e(Object(kt.a)('editStall'));
							},
						};
					},
				)(Bc),
				Vc = wt.a.div(
					vc ||
						(vc = Object(Ct.a)([
							'\n  padding-left: 15px;\n  padding-right: 15px;\n  margin-top: 30px;\n  margin-bottom: 15px;\n',
						])),
				),
				Hc = wt.a.h2(zc || (zc = Object(Ct.a)(['\n  margin-bottom: 0px;\n']))),
				qc = wt.a.p(Cc || (Cc = Object(Ct.a)(['\n  margin-top: 20px;\n']))),
				Yc = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.showAPIErrors,
										n = e.showWelcome,
										a = e.showThankYou,
										o = e.showForm,
										c = e.stall,
										s = e.election,
										r = e.errors,
										i = e.credentials,
										l = e.onStallUpdated;
									return Object(Bt.jsxs)(Vc, {
										children: [
											!0 === t && Object(Bt.jsx)(Hn, { errors: r }),
											!0 === n &&
												Object(Bt.jsxs)(yt.Fragment, {
													children: [
														Object(Bt.jsx)(Hc, { children: 'Update your sausage sizzle or cake stall' }),
														Object(Bt.jsxs)(qc, {
															children: [
																'Please complete the form below to update your stall details. Please do not submit entries that are offensive, political or do not relate to an election day stall. Please also make sure that you have authorisation to run your fundraising event at the polling place. All entries are moderated and subject to approval.',
																Object(Bt.jsx)('br', {}),
																Object(Bt.jsx)('br', {}),
																'Having trouble submitting your changes? Email us at',
																' ',
																Object(Bt.jsx)('a', {
																	href: 'mailto:ausdemocracysausage@gmail.com',
																	children: 'ausdemocracysausage@gmail.com',
																}),
																'!',
															],
														}),
													],
												}),
											!0 === a &&
												Object(Bt.jsxs)(yt.Fragment, {
													children: [
														Object(Bt.jsx)(Hc, { children: 'Thank you' }),
														Object(Bt.jsx)(qc, {
															children:
																"Thanks for letting us know about the changes to your stall! We'll let you know once they've been approved and the map has been updated.",
														}),
													],
												}),
											!0 === o &&
												void 0 !== c &&
												null != c &&
												null !== s &&
												Object(Bt.jsxs)(yt.Fragment, {
													children: [
														Object(Bt.jsxs)(Hc, { children: ['Polling place - ', s.name] }),
														Object(Bt.jsx)(Pt.i, {
															primaryText: pt(c),
															secondaryText: ut(c),
															leftIcon: Object(Bt.jsx)(Rt.ActionHome, {}),
														}),
														Object(Bt.jsx)(Wc, { stall: c, credentials: i, onStallUpdated: l }),
													],
												}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Kc = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).state = { stall: void 0, election: void 0, errors: void 0, formSubmitted: !1 }),
							(a.onStallUpdated = a.onStallUpdated.bind(Object(Ot.a)(a))),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'componentDidMount',
								value: (function () {
									var e = Object(g.a)(
										x.a.mark(function e() {
											var t, n, a, o, c, s, r;
											return x.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	(t = this.props),
																	(n = t.fetchStall),
																	(a = t.location),
																	(o = t.elections),
																	(e.next = 3),
																	n(a.query.stall_id, a.query.token, a.query.signature)
																);
															case 3:
																(c = e.sent),
																	(s = c.response),
																	(r = c.json),
																	200 === s.status
																		? this.setState(
																				Object(v.a)(
																					Object(v.a)({}, this.state),
																					{},
																					{
																						stall: r,
																						election: o.find(function (e) {
																							return e.id === r.election;
																						}),
																					},
																				),
																			)
																		: s.status >= 400 &&
																			this.setState(
																				Object(v.a)(Object(v.a)({}, this.state), {}, { stall: null, errors: r }),
																			);
															case 7:
															case 'end':
																return e.stop();
														}
												},
												e,
												this,
											);
										}),
									);
									return function () {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'onStallUpdated',
								value: function () {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { formSubmitted: !0 }));
								},
							},
							{
								key: 'getCredentials',
								value: function () {
									var e = this.props.location.query;
									return { token: e.token, signature: e.signature };
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.state,
										t = e.stall,
										n = e.election,
										a = e.formSubmitted,
										o = e.errors;
									return void 0 === t || void 0 === n
										? null
										: Object(Bt.jsxs)(yt.Fragment, {
												children: [
													Object(Bt.jsxs)(zt.a, {
														children: [
															Object(Bt.jsx)('title', {
																children: 'Democracy Sausage | Update your sausage sizzle or cake stall',
															}),
															Object(Bt.jsx)('meta', {
																property: 'og:url',
																content: 'https://public-legacy.staging.democracysausage.org',
															}),
															Object(Bt.jsx)('meta', {
																property: 'og:title',
																content: 'Democracy Sausage | Update your sausage sizzle or cake stall',
															}),
														],
													}),
													Object(Bt.jsx)(Yc, {
														showAPIErrors: void 0 !== o,
														showWelcome: !a && void 0 === o,
														showThankYou: a && void 0 === o,
														showForm: !a && void 0 === o,
														stall: t,
														election: n,
														errors: o,
														credentials: this.getCredentials(),
														onStallUpdated: this.onStallUpdated,
													}),
												],
											});
								},
							},
						]),
						n
					);
				})(yt.Component),
				Qc = Object(c.c)(
					function (e, t) {
						return { elections: e.elections.elections };
					},
					function (e) {
						return {
							fetchStall: function (t, n, a) {
								return e(
									(function (e, t, n) {
										return (function () {
											var a = Object(g.a)(
												x.a.mark(function a(o, c, s) {
													return x.a.wrap(function (a) {
														for (;;)
															switch ((a.prev = a.next)) {
																case 0:
																	return (
																		(a.next = 2), s.get('/0.1/stalls/'.concat(e, '/'), o, { token: t, signature: n })
																	);
																case 2:
																	return a.abrupt('return', a.sent);
																case 3:
																case 'end':
																	return a.stop();
															}
													}, a);
												}),
											);
											return function (e, t, n) {
												return a.apply(this, arguments);
											};
										})();
									})(t, n, a),
								);
							},
						};
					},
				)(Kc),
				Xc = n(2374),
				Jc = n(2369),
				Zc = wt.a.div(
					wc || (wc = Object(Ct.a)(['\n  margin-left: 15px;\n  margin-right: 15px;\n  margin-bottom: 30px;\n'])),
				),
				$c = wt.a.div(_c || (_c = Object(Ct.a)(['\n  cursor: pointer;\n']))),
				es = Object(wt.a)(Ia.Card)(Sc || (Sc = Object(Ct.a)(['\n  margin-bottom: 10px;\n  max-width: 400px;\n']))),
				ts = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.elections,
										n = e.onChooseElection,
										a = function (e) {
											return e.children;
										},
										o = Object(Xc.a)(Object(Jc.a)(t, 'election_day').reverse(), function (e) {
											return new Date(e.election_day).getFullYear();
										});
									return Object(Bt.jsx)(Zc, {
										children: Object.keys(o)
											.sort()
											.reverse()
											.map(function (e) {
												return Object(Bt.jsxs)(
													a,
													{
														children: [
															Object(Bt.jsx)(To.a, { children: e }),
															o[e].map(function (e) {
																return Object(Bt.jsx)(
																	$c,
																	{
																		onClick: function () {
																			return n(e);
																		},
																		children: Object(Bt.jsx)(es, {
																			children: Object(Bt.jsx)(Ia.CardHeader, {
																				title: e.name,
																				textStyle: { maxWidth: '190px', whiteSpace: 'normal', paddingRight: '0px' },
																				subtitle: new Date(e.election_day).toLocaleDateString('en-AU', {
																					day: '2-digit',
																					month: 'long',
																					year: 'numeric',
																				}),
																				avatar: Object(Bt.jsx)(Yn.a, {
																					size: 50,
																					style: { fontSize: 20 },
																					children: G(e),
																				}),
																			}),
																		}),
																	},
																	e.id,
																);
															}),
														],
													},
													e,
												);
											}),
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				ns = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.elections,
										a = e.onChooseElection;
									return void 0 === t
										? null
										: Object(Bt.jsxs)(yt.Fragment, {
												children: [
													Object(Bt.jsxs)(zt.a, {
														children: [
															Object(Bt.jsx)('title', { children: n.pageTitle }),
															Object(Bt.jsx)('meta', {
																property: 'og:url',
																content: ''
																	.concat('https://public-legacy.staging.democracysausage.org')
																	.concat(n.pageBaseURL),
															}),
															Object(Bt.jsx)('meta', { property: 'og:title', content: n.pageTitle }),
														],
													}),
													Object(Bt.jsx)(ts, { elections: t, onChooseElection: a }),
												],
											});
								},
							},
						]),
						n
					);
				})(yt.Component);
			(ns.muiName = 'ElectionChooserContainer'),
				(ns.pageTitle = 'Democracy Sausage | Elections'),
				(ns.pageBaseURL = '/elections');
			var as,
				os,
				cs,
				ss,
				rs,
				is,
				ls,
				ds,
				ps,
				us,
				ms,
				js = Object(c.c)(
					function (e) {
						return { elections: e.elections.elections };
					},
					function (e, t) {
						return {
							onChooseElection: function (t) {
								ca.event({ category: 'ElectionChooserContainer', action: 'onChooseElectionFromList' }),
									e(Ee()),
									s.d.push('/'.concat(D(t)));
							},
						};
					},
				)(ns),
				fs = n(414),
				hs = n.n(fs),
				bs = n(841),
				Os = wt.a.div(as || (as = Object(Ct.a)(['\n  padding-left: 15px;\n  padding-right: 15px;\n']))),
				xs = Object(wt.a)(Pt.n)(os || (os = Object(Ct.a)(['\n  width: 350px !important;\n  margin-bottom: 20px;\n']))),
				gs = Object(wt.a)(Pt.u)(cs || (cs = Object(Ct.a)(['\n  width: 450px !important;\n  margin-right: 20px;\n']))),
				ys = wt.a.div(ss || (ss = Object(Ct.a)(['\n  width: 900px;\n  height: 472.5px;\n']))),
				vs = wt.a.code(
					rs ||
						(rs = Object(Ct.a)([
							'\n  background-color: #f4f4f4;\n  border: 1px solid #e4e2e2;\n  display: block;\n  padding: 20px;\n',
						])),
				),
				zs = [
					{ name: 'Australia', extent: [112.568664550781, -10.1135419412474, 154.092864990234, -44.2422476272383] },
					{
						name: 'Australian Capital Territory',
						extent: [148.677978515625, -35.07496485398955, 149.43603515625, -35.96022296929668],
					},
					{
						name: 'New South Wales',
						extent: [140.6015665303642, -28.13879606611416, 154.1025132963242, -38.02075411828389],
					},
					{ name: 'Northern Territory', extent: [128.14453125, -9.275622176792098, 138.8671875, -26.509904531413923] },
					{ name: 'Queensland', extent: [137.724609375, -8.494104537551863, 155.478515625, -29.76437737516313] },
					{
						name: 'South Australia',
						extent: [128.58398437499997, -25.48295117535531, 141.591796875, -38.82259097617711],
					},
					{ name: 'Tasmania', extent: [142.998046875, -39.19820534889478, 149.1943359375, -44.245199015221274] },
					{ name: 'Victoria', extent: [140.899144152847, -32.0615020550698, 150.074726746086, -39.2320874986644] },
					{
						name: 'Western Australia',
						extent: [111.796875, -12.726084296948173, 129.19921874999997, -35.88905007936091],
					},
				],
				Cs = function (e, t) {
					var n = ''.concat('https://public-legacy.staging.democracysausage.org', '/').concat(D(e), '?embed');
					return null !== t ? ''.concat(n, '&extent=').concat(t) : n;
				};
			function ws() {
				var e = Object(c.f)(function (e) {
						return e.elections.elections;
					}),
					t = vt.a.useState(e[0].id),
					n = Object(le.a)(t, 2),
					a = n[0],
					o = n[1],
					s = e.find(function (e) {
						return e.id === a;
					}),
					r = vt.a.useState(null),
					i = Object(le.a)(r, 2),
					l = i[0],
					d = i[1],
					p = Object(bs.a)(),
					u = Object(le.a)(p, 2)[1];
				if (void 0 === s) return null;
				var m = ''
						.concat('https://public-legacy.staging.democracysausage.org/api', '/0.1/map_image/')
						.concat(s.id, '/'),
					j = '<iframe src="'.concat(
						Cs(s, l),
						'" title="Democracy Sausage"\n  scrolling="no"\n  loading="lazy"\n  allowTransparency="false"\n  allowFullScreen="true"\n  width="100%"\n  height="472.5"\n  style="border: none;"></iframe>',
					);
				return Object(Bt.jsxs)(Os, {
					children: [
						Object(Bt.jsx)('p', { children: 'Would you like to embed the Democracy Sausage map on your website?' }),
						Object(Bt.jsxs)(vt.a.Fragment, {
							children: [
								Object(Bt.jsx)('h2', { children: 'Choose an election' }),
								Object(Bt.jsx)(xs, {
									value: a,
									onChange: function (e, t, n) {
										o(n);
									},
									autoWidth: !0,
									children: e.map(function (e) {
										return Object(Bt.jsx)(Pt.j, { value: e.id, primaryText: e.name }, e.id);
									}),
								}),
							],
						}),
						Object(Bt.jsxs)(vt.a.Fragment, {
							children: [
								Object(Bt.jsx)('h2', { children: 'Embed an image of the map' }),
								Object(Bt.jsx)('img', { src: m }),
								Object(Bt.jsx)('br', {}),
								Object(Bt.jsx)(gs, { name: 'embed_image_url', value: m, fullWidth: !1 }),
								Object(Bt.jsx)(Pt.m, {
									primary: !0,
									icon: Object(Bt.jsx)(hs.a, {}),
									label: 'Copy link',
									onClick: function () {
										return u(m);
									},
								}),
								Object(Bt.jsx)('br', {}),
								Object(Bt.jsx)('br', {}),
							],
						}),
						Object(Bt.jsxs)(vt.a.Fragment, {
							children: [
								Object(Bt.jsx)('h2', { children: 'Embed an interactive map' }),
								Object(Bt.jsx)(xs, {
									floatingLabelText: 'Zoom to an area',
									value: l,
									onChange: function (e, t, n) {
										d(n);
									},
									autoWidth: !0,
									children: zs.map(function (e) {
										return Object(Bt.jsx)(Pt.j, { value: e.extent, primaryText: e.name }, e.name);
									}),
								}),
								Object(Bt.jsx)(ys, {
									children: Object(Bt.jsx)('iframe', {
										src: ''.concat(Cs(s, l)),
										title: 'Democracy Sausage',
										scrolling: 'no',
										loading: 'lazy',
										allowTransparency: !1,
										allowFullScreen: !0,
										width: '100%',
										height: '472.5',
										style: { border: 'none' },
									}),
								}),
								Object(Bt.jsx)('br', {}),
								Object(Bt.jsx)('pre', { children: Object(Bt.jsx)(vs, { children: j }) }),
								Object(Bt.jsx)(Pt.m, {
									primary: !0,
									icon: Object(Bt.jsx)(hs.a, {}),
									label: 'Copy code',
									onClick: function () {
										return u(j);
									},
								}),
							],
						}),
					],
				});
			}
			var _s = wt.a.div(
					is ||
						(is = Object(Ct.a)([
							'\n  width: 85%;\n  margin-top: 10px;\n  margin-left: 7.5%;\n  margin-right: 7.5%;\n',
						])),
				),
				Ss = Object(wt.a)(Pt.k)(ls || (ls = Object(Ct.a)(['\n  margin-bottom: 15px;\n']))),
				Es = Object(wt.a)(Pt.v)(ds || (ds = Object(Ct.a)(['\n  margin-bottom: 15px;\n']))),
				ks = wt.a.div(ps || (ps = Object(Ct.a)(['\n  padding-bottom: 68px;\n']))),
				Ts = wt.a.div(us || (us = Object(Ct.a)(['\n  padding-bottom: 20px;\n']))),
				Ps = wt.a.div(ms || (ms = Object(Ct.a)(['\n  position: absolute;\n  bottom: 16px;\n  right: 16px;\n'])));
			function Ms() {
				var e = Object(c.f)(function (e) {
						return e.elections.elections.find(function (t) {
							return t.id === e.elections.current_election_id;
						});
					}),
					t = vt.a.useState(!0),
					n = Object(le.a)(t, 2),
					a = n[0],
					o = n[1],
					r = Object(c.f)(function (e) {
						return e.map.place;
					}),
					i = vt.a.useState(r),
					l = Object(le.a)(i, 2),
					d = l[0],
					p = l[1],
					u = Object(c.e)(),
					m = (function () {
						var e = Object(g.a)(
							x.a.mark(function e(t) {
								return x.a.wrap(function (e) {
									for (;;)
										switch ((e.prev = e.next)) {
											case 0:
												ca.event({
													category: 'SausageNearMeFinder',
													action: 'findNearestPollingPlaces',
													label: 'Searched for polling places near an address',
												}),
													p(t),
													u(ke(t));
											case 3:
											case 'end':
												return e.stop();
										}
								}, e);
							}),
						);
						return function (t) {
							return e.apply(this, arguments);
						};
					})(),
					j = ie(
						{
							election_id: e.id,
							lonlat: ''
								.concat(null === d || void 0 === d ? void 0 : d.geometry.location.lng(), ',')
								.concat(null === d || void 0 === d ? void 0 : d.geometry.location.lat()),
						},
						{ skip: void 0 === d },
					),
					f = j.data,
					h = j.error,
					b = j.isLoading;
				if (void 0 !== r && void 0 !== f) {
					var O = (function (e) {
						return {
							lat_top: Math.max.apply(
								Math,
								Object(z.a)(
									e.map(function (e) {
										return e.geom.coordinates[1];
									}),
								),
							),
							lat_bottom: Math.min.apply(
								Math,
								Object(z.a)(
									e.map(function (e) {
										return e.geom.coordinates[1];
									}),
								),
							),
							lon_left: Math.min.apply(
								Math,
								Object(z.a)(
									e.map(function (e) {
										return e.geom.coordinates[0];
									}),
								),
							),
							lon_right: Math.max.apply(
								Math,
								Object(z.a)(
									e.map(function (e) {
										return e.geom.coordinates[0];
									}),
								),
							),
						};
					})(f);
					u(
						Se({
							lon: r.geometry.location.lng(),
							lat: r.geometry.location.lat(),
							extent: [O.lon_left, O.lat_bottom, O.lon_right, O.lat_top],
							formattedAddress: r.formatted_address,
						}),
					);
				}
				var y =
						void 0 !== f
							? f.filter(function (e) {
									return !0 !== a || !0 === et(e);
								})
							: void 0,
					v = void 0 === h && !1 === b && void 0 !== y && y.length > 0;
				return Object(Bt.jsxs)(_s, {
					children: [
						!1 === e.polling_places_loaded &&
							Object(Bt.jsx)(Ss, {
								children: Object(Bt.jsx)(Pt.i, {
									leftAvatar: Object(Bt.jsx)(Pt.b, {
										icon: Object(Bt.jsx)(Rt.ActionInfo, {}),
										backgroundColor: Ie.blue500,
									}),
									primaryText: "Polling places haven't been announced yet",
									secondaryText: "Until then we're only listing stalls reported by the community.",
									secondaryTextLines: 2,
									disabled: !0,
								}),
							}),
						Object(Bt.jsx)(Pa, {
							componentRestrictions: { country: 'AU' },
							hintText: 'Search here',
							onChoosePlace: m,
							searchText: void 0 !== d ? d.formatted_address : void 0,
							autoFocus: !1,
							initModeOverride: void 0 !== d ? V.DO_NOTHING : void 0,
						}),
						Object(Bt.jsx)('br', {}),
						!0 === b && Object(Bt.jsx)(Pt.c, {}),
						void 0 === h &&
							!1 === b &&
							void 0 !== y &&
							0 === y.length &&
							Object(Bt.jsx)(Ss, {
								children: Object(Bt.jsx)(Pt.i, {
									leftAvatar: Object(Bt.jsx)(Pt.b, {
										icon: Object(Bt.jsx)(Rt.ActionInfo, {}),
										backgroundColor: Ie.blue500,
									}),
									primaryText: "Oh no! We couldn't find any sausages or cakes at your local polling places.",
									disabled: !0,
								}),
							}),
						void 0 === h &&
							!1 === b &&
							void 0 !== y &&
							Object(Bt.jsx)(Es, {
								label: 'Only show booths with food and drink',
								toggled: a,
								onToggle: function (e, t) {
									o(t);
								},
								labelPosition: 'right',
								thumbStyle: { backgroundColor: 'rgb(245, 245, 245)' },
								trackStyle: { backgroundColor: 'rgb(189, 189, 189)' },
							}),
						!0 === v &&
							void 0 !== y &&
							Object(Bt.jsx)(ks, {
								children: y.map(function (t) {
									return Object(Bt.jsx)(Ts, { children: Object(Bt.jsx)(Wn, { pollingPlace: t, election: e }) }, t.id);
								}),
							}),
						void 0 !== h &&
							Object(Bt.jsx)(Ss, {
								children: Object(Bt.jsx)(Pt.i, {
									leftAvatar: Object(Bt.jsx)(Pt.b, {
										icon: Object(Bt.jsx)(Rt.ActionInfo, {}),
										backgroundColor: Ie.blue500,
									}),
									primaryText: 'Oh no! We hit an error while trying to find your nearby polling places.',
									disabled: !0,
								}),
							}),
						void 0 === h &&
							!1 === b &&
							void 0 !== y &&
							Object(Bt.jsx)(Ps, {
								children: Object(Bt.jsx)(Pt.f, {
									onClick: function () {
										return s.d.push('/'.concat(D(e)));
									},
									children: Object(Bt.jsx)(Rt.SocialPublic, {}),
								}),
							}),
					],
				});
			}
			var Rs,
				As,
				Is,
				Ls,
				Fs,
				Ns,
				Ds,
				Us,
				Gs,
				Bs,
				Ws,
				Vs,
				Hs = n(234),
				qs = n(827),
				Ys = n.n(qs),
				Ks =
					(n(2184),
					(function (e) {
						Object(xt.a)(n, e);
						var t = Object(gt.a)(n);
						function n(e) {
							var a;
							return (
								Object(je.a)(this, n),
								((a = t.call(this, e)).intervalId = void 0),
								(a.icons = ['bbq', 'cake', 'coffee', 'bacon_and_eggs', 'vego']),
								(a.messages = [
									'Sizzling snags',
									'Icing the cupcakes',
									'Grinding the beans',
									'Lighting the BBQ',
									'Shearing the kale',
								]),
								(a.intervalId = window.setInterval(
									function (e, t) {
										var n = document.getElementById('loaderImage');
										if (null !== n) {
											var a = e.findIndex(function (e) {
													return 'sprite_05-'.concat(e) === n.className;
												}),
												o = 0;
											a < e.length - 1 && (o = a + 1), (n.className = 'sprite_05-'.concat(e[o]));
										}
										var c = document.getElementById('loaderMessage');
										if (null !== c) {
											var s = t.findIndex(function (e) {
													return ''.concat(e, '...') === c.innerHTML;
												}),
												r = 0;
											s < t.length - 1 && (r = s + 1),
												c.classList.add('fade'),
												window.setTimeout(function () {
													c.innerHTML = ''.concat(t[r], '...');
												}, 1e3),
												window.setTimeout(function () {
													c.classList.remove('fade');
												}, 2e3);
										}
									},
									4e3,
									a.icons,
									a.messages,
								)),
								a
							);
						}
						return (
							Object(fe.a)(n, [
								{
									key: 'componentWillUnmount',
									value: function () {
										void 0 !== this.intervalId && window.clearInterval(this.intervalId);
									},
								},
								{
									key: 'render',
									value: function () {
										return Object(Bt.jsxs)('div', {
											className: 'loader',
											children: [
												Object(Bt.jsx)('div', {
													className: 'image',
													children: Object(Bt.jsx)('div', {
														id: 'loaderImage',
														className: 'sprite_05-bbq_and_cake_tick',
													}),
												}),
												Object(Bt.jsx)('span', { id: 'loaderMessage', children: 'Loading map...' }),
											],
										});
									},
								},
							]),
							n
						);
					})(yt.PureComponent)),
				Qs = n(421),
				Xs = n(426),
				Js = n(338),
				Zs = n(583),
				$s = n(177),
				er = n(144),
				tr = n(844),
				nr = n(582),
				ar = n(842),
				or = n(270),
				cr = (n(2185), n(27)),
				sr = n(843),
				rr = n(584),
				ir = n(269),
				lr = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).map = void 0),
							(a.vectorSourceChangedEventKey = void 0),
							(a.timeoutIds = void 0),
							(a.map = null),
							(a.timeoutIds = []),
							(a.onMapContainerResize = a.onMapContainerResize.bind(Object(Ot.a)(a))),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'componentDidMount',
								value: function () {
									var e = this.props.election;
									this.map = new ar.a({ layers: this.getBasemap(), target: 'openlayers-map', controls: [new Qs.a()] });
									var t = this.map.getView(),
										n = new er.a(e.geom.coordinates).transform('EPSG:4326', 'EPSG:3857');
									t.fit(n, {
										size: this.map.getSize(),
										callback: function (e) {
											if (!0 === e) {
												var n = t.getCenter();
												void 0 !== n && ((n[0] -= 1), t.setCenter(n));
											}
										},
									}),
										window.addEventListener('resize', this.onMapContainerResize),
										this.onMapContainerResize(),
										this.map.addLayer(this.getMapDataVectorLayer(this.map)),
										this.map.on('singleclick', this.onClickMap.bind(this));
								},
							},
							{
								key: 'componentDidUpdate',
								value: function (e) {
									var t = this;
									if (null !== this.map)
										if (e.mapSearchResults !== this.props.mapSearchResults)
											null !== this.props.mapSearchResults
												? this.zoomMapToSearchResults(this.map)
												: this.clearSearchResultsVectorLayer(this.map);
										else if (JSON.stringify(e.mapFilterOptions) !== JSON.stringify(this.props.mapFilterOptions)) {
											var n = this.getLayerByProperties(this.map, 'isSausageLayer', !0);
											null !== n &&
												n.setStyle(function (e, n) {
													return Ae(e, n, t.props.mapFilterOptions);
												});
										}
								},
							},
							{
								key: 'componentWillUnmount',
								value: function () {
									var e = this;
									(void 0 !== this.vectorSourceChangedEventKey && or.b(this.vectorSourceChangedEventKey),
									this.timeoutIds.forEach(function (e) {
										return window.clearTimeout(e);
									}),
									window.removeEventListener('resize', this.onMapContainerResize),
									null !== this.map) &&
										(Object(z.a)(this.map.getLayers().getArray()).forEach(function (t) {
											null !== e.map && e.map.removeLayer(t);
										}),
										Object(z.a)(this.map.getControls().getArray()).forEach(function (t) {
											null !== e.map && e.map.removeControl(t);
										}),
										Object(z.a)(this.map.getInteractions().getArray()).forEach(function (t) {
											null !== e.map && e.map.removeInteraction(t);
										}));
									null !== this.map && (this.map.setTarget(null), (this.map = null));
								},
							},
							{
								key: 'onMapContainerResize',
								value: function () {
									var e = window.setTimeout(
										function (e) {
											void 0 !== e && null !== e && e.updateSize();
										},
										200,
										this.map,
									);
									this.timeoutIds.push(e);
								},
							},
							{
								key: 'onVectorSourceChanged',
								value: function (e) {
									var t = this.props,
										n = t.geojson,
										a = t.mapSearchResults,
										o = t.onMapDataLoaded,
										c = t.onMapLoaded,
										s = e.target;
									if ('ready' === s.getState()) {
										if (void 0 === n) o(new Zs.a().writeFeaturesObject(s.getFeatures()));
										var r = window.setTimeout(
											function () {
												null !== this.map &&
													(c(),
													null !== a
														? this.zoomMapToSearchResults(this.map)
														: this.workaroundOLRenderingBug(this.map.getView()));
											}.bind(this),
											750,
										);
										this.timeoutIds.push(r);
									}
								},
							},
							{
								key: 'onClickMap',
								value: function (e) {
									var t = this.props.onQueryMap;
									if (null !== this.map) {
										ca.event({ category: 'OpenLayersMap', action: 'Query Features' });
										var n = [];
										this.map.forEachFeatureAtPixel(
											e.pixel,
											function (e, t) {
												n.push(e);
											},
											{
												hitTolerance: 3,
												layerFilter: function (e) {
													var t = e.getProperties();
													return 'isSausageLayer' in t && !0 === t.isSausageLayer;
												},
											},
										),
											ca.event({
												category: 'OpenLayersMap',
												action: 'Query Features',
												label: 'Number of Features',
												value: n.length,
											}),
											n.length > 0 && t(n.slice(0, 21));
									}
								},
							},
							{
								key: 'getSearchResultsVectorLayer',
								value: function (e) {
									var t = this.props.mapSearchResults;
									if (null !== t) {
										var n = new Xs.a({ geometry: new $s.a(Object(cr.p)([t.lon, t.lat], 'EPSG:4326', 'EPSG:3857')) });
										n.setStyle(
											new pe.b({
												image: new ir.a({
													fill: new he.a({ color: '#6740b4' }),
													stroke: new be.a({ color: 'black', width: 2 }),
													points: 5,
													radius: 10,
													radius2: 4,
													angle: 0,
												}),
											}),
										);
										var a = new nr.a({ source: new rr.a({ features: [n] }) });
										return a.setProperties({ isSearchIndicatorLayer: !0 }), a;
									}
									return null;
								},
							},
							{
								key: 'getMapDataVectorLayer',
								value: function (e) {
									var t = this.props,
										n = t.election,
										a = t.geojson,
										o = t.mapFilterOptions,
										c = t.onMapBeginLoading,
										s = new rr.a({
											format: new Zs.a(),
											loader: function (e, t, o) {
												var s = this;
												return Object(g.a)(
													x.a.mark(function r() {
														var i;
														return x.a.wrap(function (r) {
															for (;;)
																switch ((r.prev = r.next)) {
																	case 0:
																		void 0 === a
																			? (c(),
																				(i = ''
																					.concat(
																						'https://public-legacy.staging.democracysausage.org/api',
																						'/0.1/map/?election_id=',
																					)
																					.concat(n.id, '&s=')
																					.concat(Date.now())),
																				Object(Js.a)(i, s.getFormat()).call(
																					s,
																					e,
																					t,
																					o,
																					function () {},
																					function () {},
																				))
																			: s.addFeatures(s.getFormat().readFeatures(a));
																	case 1:
																	case 'end':
																		return r.stop();
																}
														}, r);
													}),
												)();
											},
										});
									this.vectorSourceChangedEventKey = s.once('change', this.onVectorSourceChanged.bind(this));
									var r = new nr.a({
										renderMode: 'image',
										source: s,
										style: function (e, t) {
											return Ae(e, t, o);
										},
									});
									return r.setProperties({ isSausageLayer: !0 }), r;
								},
							},
							{
								key: 'getLayerByProperties',
								value: function (e, t, n) {
									var a = null;
									return (
										e.getLayers().forEach(function (e) {
											var o = e.getProperties();
											t in o && o[t] === n && (a = e);
										}),
										a
									);
								},
							},
							{
								key: 'getBasemap',
								value: function () {
									return (
										ca.event({ category: 'OpenLayersMap', action: 'Basemap Shown', label: 'Carto' }),
										[
											new tr.a({
												source: new sr.a({
													url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
													attributions:
														'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
												}),
											}),
										]
									);
								},
							},
							{
								key: 'zoomMapToSearchResults',
								value: function (e) {
									var t = this.props.mapSearchResults,
										n = this;
									if (null !== t) {
										var a = e.getView();
										null !== t.extent
											? (this.clearSearchResultsVectorLayer(e),
												a.fit(Object(cr.q)(t.extent, 'EPSG:4326', 'EPSG:3857'), {
													size: e.getSize(),
													duration: void 0 !== t.animation ? 0 : 750,
													padding: void 0 !== t.padding ? [0, 0, 50, 0] : [85, 0, 20, 0],
													callback: function (t) {
														!0 === t && n.addSearchResultsVectorLayer(e);
													},
												}))
											: null !== t.lat &&
												null !== t.lon &&
												a.fit(new $s.a(Object(cr.p)([t.lon, t.lat], 'EPSG:4326', 'EPSG:3857')), {
													minResolution: 4,
													size: e.getSize(),
													duration: 750,
												});
									}
								},
							},
							{
								key: 'clearSearchResultsVectorLayer',
								value: function (e) {
									var t = this.getLayerByProperties(e, 'isSearchIndicatorLayer', !0);
									null !== t && e.removeLayer(t);
								},
							},
							{
								key: 'addSearchResultsVectorLayer',
								value: function (e) {
									this.workaroundOLRenderingBug(e.getView());
									var t = this.getSearchResultsVectorLayer(e);
									null !== t && e.addLayer(t);
								},
							},
							{ key: 'workaroundOLRenderingBug', value: function (e) {} },
							{
								key: 'render',
								value: function () {
									return Object(Bt.jsx)('div', { id: 'openlayers-map', className: 'openlayers-map' });
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				dr = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.mapSearchResults,
										a = e.mapFilterOptions,
										o = e.onMapBeginLoading,
										c = e.onMapLoaded,
										s = e.onQueryMap,
										r = e.geojson,
										i = e.stashMapData;
									return Object(Bt.jsx)(
										lr,
										{
											election: t,
											geojson: r,
											mapSearchResults: n,
											mapFilterOptions: a,
											onMapBeginLoading: o,
											onMapDataLoaded: i,
											onMapLoaded: c,
											onQueryMap: s,
										},
										t.id,
									);
								},
							},
						]),
						n
					);
				})(yt.Component),
				pr = Object(c.c)(
					function (e, t) {
						return { geojson: e.map.geojson[t.election.id] };
					},
					function (e, t) {
						return {
							stashMapData: function (n) {
								e(
									(function (e, t) {
										return { type: ve, electionId: e, geojson: t };
									})(t.election.id, n),
								);
							},
						};
					},
				)(dr),
				ur = wt.a.div(
					Rs ||
						(Rs = Object(Ct.a)(['\n  height: 100%;\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n'])),
				),
				mr = wt.a.div(
					As ||
						(As = Object(Ct.a)([
							'\n  position: absolute;\n  width: 85%;\n  margin-top: 10px;\n  margin-left: 7.5%;\n  margin-right: 7.5%;\n',
						])),
				),
				jr = wt.a.div(
					Is ||
						(Is = Object(Ct.a)([
							'\n  position: absolute;\n  height: calc(100% - 80px); /* Height of PollingPlaceFilterToolbar */\n  width: 100%;\n  margin: 0 auto;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  overflow: auto;\n',
						])),
				),
				fr = wt.a.div(
					Ls ||
						(Ls = Object(Ct.a)(['\n  height: 100px;\n  width: 100%;\n  background-color: rgba(103, 64, 180, 0.8);\n'])),
				),
				hr = wt.a.div(Fs || (Fs = Object(Ct.a)(['\n  position: absolute;\n  bottom: 16px;\n  right: 16px;\n']))),
				br = wt.a.div(Ns || (Ns = Object(Ct.a)(['\n  position: absolute;\n  bottom: 88px;\n  right: 16px;\n']))),
				Or = Object(wt.a)(Pt.w)(Ds || (Ds = Object(Ct.a)(['\n  background-color: white !important;\n']))),
				xr = Object(wt.a)(Pt.x)(Us || (Us = Object(Ct.a)(['\n  width: 100%;\n  max-width: 300px;\n']))),
				gr = Object(wt.a)(Pt.y)(Gs || (Gs = Object(Ct.a)(['\n  margin-left: 12px !important;\n']))),
				yr = wt.a.div(Bs || (Bs = Object(Ct.a)(['\n  padding: 10px;\n']))),
				vr = Object(wt.a)(Pt.w)(
					Ws || (Ws = Object(Ct.a)(['\n  background-color: white !important;\n  padding-left: 12px !important;\n'])),
				),
				zr = Object(wt.a)(Fa.a)(
					Vs || (Vs = Object(Ct.a)(['\n  & span {\n    text-transform: none !important;\n  }\n'])),
				),
				Cr = function (e) {
					var t,
						n = new URLSearchParams(window.location.search);
					return !0 === n.has('extent') && '' !== n.get('extent')
						? {
								extent: null === (t = n.get('extent')) || void 0 === t ? void 0 : t.split(','),
								padding: !1,
								animation: !1,
							}
						: e;
				},
				wr = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).onMapBeginLoading = void 0),
							(a.onMapLoaded = void 0),
							(a.onClickMapFilterOption = void 0),
							(a.onCloseNT2020Dialog = void 0),
							(a.state = { mapLoading: void 0, nt2020DialogOpen: !0 }),
							(a.onMapBeginLoading = function () {
								return a.setState({ mapLoading: !0 });
							}),
							(a.onMapLoaded = function () {
								return a.setState({ mapLoading: !1 });
							}),
							(a.onClickMapFilterOption = function (t) {
								return function (n) {
									return e.onClickMapFilterOption(t);
								};
							}),
							(a.onCloseNT2020Dialog = function () {
								return a.setState({ nt2020DialogOpen: !1 });
							}),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.currentElection,
										n = e.embeddedMap,
										a = e.waitingForGeolocation,
										o = e.queriedPollingPlaces,
										c = e.geolocationSupported,
										r = e.mapSearchResults,
										i = e.mapFilterOptions,
										l = e.onQueryMap,
										d = e.onCloseQueryMapDialog,
										p = e.onOpenFinderForAddressSearch,
										u = e.onOpenFinderForGeolocation,
										m = e.onClearMapSearch,
										j = this.state,
										f = j.mapLoading,
										h = j.nt2020DialogOpen;
									return Object(Bt.jsxs)(yt.Fragment, {
										children: [
											Object(Bt.jsxs)(ur, {
												children: [
													Object(Bt.jsxs)('div', {
														className: 'openlayers-map-container',
														children: [
															Object(Bt.jsx)(
																pr,
																{
																	election: t,
																	mapSearchResults: Cr(r),
																	mapFilterOptions: i,
																	onMapBeginLoading: this.onMapBeginLoading,
																	onMapLoaded: this.onMapLoaded,
																	onQueryMap: l,
																},
																t.id,
															),
															!1 === n &&
																Object(Bt.jsx)(hr, {
																	children: Object(Bt.jsx)(Pt.f, {
																		containerElement: Object(Bt.jsx)(s.a, { to: '/add-stall' }),
																		children: Object(Bt.jsx)(Rt.MapsAddLocation, {}),
																	}),
																}),
															!1 === n &&
																null !== r &&
																Object(Bt.jsx)(br, {
																	children: Object(Bt.jsx)(Pt.f, {
																		containerElement: Object(Bt.jsx)(s.a, { to: '/search/'.concat(D(t)) }),
																		children: Object(Bt.jsx)(Rt.ActionList, {}),
																	}),
																}),
														],
													}),
													!0 === f &&
														Object(Bt.jsx)(jr, {
															className: 'map-loading',
															children: Object(Bt.jsx)(fr, { children: Object(Bt.jsx)(Ks, {}) }),
														}),
													!1 === n &&
														Object(Bt.jsx)(mr, {
															children: Object(Bt.jsx)(aa.a, {
																params: { key: 'AIzaSyBuOuavKmg0pKmdGEPdugThfnKQ7v1sSH0', libraries: 'places' },
																render: function (e) {
																	return (
																		e &&
																		Object(Bt.jsx)(Ea.a, {
																			hintText:
																				!1 === a ? 'Search here or use GPS \u2192' : 'Fetching your location...',
																			value: null !== r ? r.formattedAddress : void 0,
																			onChange: function (e) {
																				'' === e && m();
																			},
																			onClick: p,
																			onRequestSearch: !0 === c ? u : p,
																			searchIcon:
																				!0 === c
																					? !1 === a
																						? Object(Bt.jsx)(Rt.DeviceLocationSearching, {})
																						: Object(Bt.jsx)(Rt.DeviceLocationSearching, { className: 'spin' })
																					: Object(Bt.jsx)(Rt.ActionSearch, {}),
																			style: { margin: '0 auto', maxWidth: 800 },
																		})
																	);
																},
															}),
														}),
													!1 === n &&
														Object(Bt.jsx)(vr, {
															children: Object(Bt.jsx)(Pt.x, {
																firstChild: !0,
																children: Object(Bt.jsx)(zr, {
																	label: 'COVID safe voting',
																	icon: Object(Bt.jsx)(Rt.MapsLocalHospital, { color: 'red' }),
																	containerElement: Object(Bt.jsx)('a', {
																		href: 'https://aec.gov.au/election/covid19-safety-measures.htm',
																	}),
																}),
															}),
														}),
													!1 === n &&
														Object(Bt.jsx)(Or, {
															children: Object(Bt.jsxs)(xr, {
																children: [
																	Object(Bt.jsx)(Rt.MapsRestaurantMenu, { color: Ie.grey600 }),
																	Object(Bt.jsx)(gr, {}),
																	Object(Bt.jsx)(Pt.g, {
																		onClick: this.onClickMapFilterOption('vego'),
																		children: Object(Bt.jsx)(yn, { disabled: !0 !== Re('vego', i) }),
																	}),
																	Object(Bt.jsx)(Pt.g, {
																		onClick: this.onClickMapFilterOption('halal'),
																		children: Object(Bt.jsx)(Xt, { disabled: !0 !== Re('halal', i) }),
																	}),
																	Object(Bt.jsx)(Pt.g, {
																		onClick: this.onClickMapFilterOption('coffee'),
																		children: Object(Bt.jsx)(Kt, { disabled: !0 !== Re('coffee', i) }),
																	}),
																	Object(Bt.jsx)(Pt.g, {
																		onClick: this.onClickMapFilterOption('bacon_and_eggs'),
																		children: Object(Bt.jsx)(Vt, { disabled: !0 !== Re('bacon_and_eggs', i) }),
																	}),
																],
															}),
														}),
												],
											}),
											'Northern Territory Election 2020' === t.name &&
												Object(Bt.jsxs)(Pt.d, {
													title: "G'day Territorians",
													open: h,
													onRequestClose: this.onCloseNT2020Dialog,
													autoScrollBodyContent: !0,
													titleStyle: { textAlign: 'left' },
													contentStyle: {
														width: '60%',
														minWidth: '300px',
														maxWidth: 'none',
														textAlign: 'justify',
														color: 'rgb(0, 0, 0)',
													},
													children: [
														Object(Bt.jsx)('img', {
															src: 'images/media_release_demsausage_logo.png',
															alt: 'The Democracy Sausage logo in the style of the Australian coat of arms. A kangaroo and an emu are standing on either side of a BBQ.',
															style: {
																width: '50%',
																minWidth: '150px',
																maxWidth: '250px',
																display: 'block',
																margin: '0 auto',
															},
														}),
														Object(Bt.jsx)('h3', {
															style: { marginTop: 10, marginBottom: 0, textAlign: 'center' },
															children: 'DEMOCRACY SAUSAGE',
														}),
														Object(Bt.jsx)('h3', {
															style: { marginTop: 10, marginBottom: 0, textAlign: 'center' },
															children: 'MEDIA STATEMENT: 18 August 2020',
														}),
														Object(Bt.jsx)('br', {}),
														Object(Bt.jsx)('h3', {
															style: { marginTop: 10, marginBottom: 0, textAlign: 'center' },
															children: 'Supporting community fundraising during the Northern Territory election',
														}),
														Object(Bt.jsx)('p', {
															children:
																'The Northern Territory election on Saturday 22nd August 2020 will be the first major Australian election since the beginning of the COVID-19 pandemic, and one of several that will be held over the coming year.',
														}),
														Object(Bt.jsx)('p', {
															children:
																'For those who need to vote in person, your local electoral commission\u2019s priority will be to make the experience as fast and safe as possible, minimising the time voters spend at a polling place.',
														}),
														Object(Bt.jsx)('p', {
															children:
																'Postal voting will reduce attendance at polling places, and in many locations, fundraising will be limited or prohibited.',
														}),
														Object(Bt.jsx)('p', {
															children:
																'Election day sausage sizzles and bake sales have traditionally provided a welcome boost in funding for local schools and community groups - one that will be greatly missed this year.',
														}),
														Object(Bt.jsx)('p', {
															children:
																'We encourage Northern Territorians who would normally buy a Democracy Sausage or cupcake to consider making a small donation, either to a local cause or one of the following registered charities:',
														}),
														Object(Bt.jsxs)('ul', {
															style: { textAlign: 'left' },
															children: [
																Object(Bt.jsxs)('li', {
																	style: { marginBottom: 10 },
																	children: [
																		Object(Bt.jsxs)('strong', {
																			children: [
																				"Katherine Isolated Children's Service: ",
																				Object(Bt.jsx)('a', { href: 'https://www.kics.org.au', children: 'Donate' }),
																			],
																		}),
																		Object(Bt.jsx)('p', {
																			children:
																				'The Katherine Isolated Children\u2019s Service provides play based learning opportunities for children and families who are socially and geographically isolated living on pastoral properties, in Indigenous communities, and in the small towns of Mataranka, Timber Creek and Elliott.',
																		}),
																	],
																}),
																Object(Bt.jsxs)('li', {
																	style: { marginBottom: 10 },
																	children: [
																		Object(Bt.jsxs)('strong', {
																			children: [
																				'Corrugated Iron Youth Arts: ',
																				Object(Bt.jsx)('a', {
																					href: 'https://www.corrugatediron.org.au',
																					children: 'Donate',
																				}),
																			],
																		}),
																		Object(Bt.jsx)('p', {
																			children:
																				'Corrugated Iron empowers young people through dynamic creative arts and is the premier youth arts organisation in the Top End of the Northern Territory. For more than 30 years, we have provided innovative and challenging performing arts experiences that express the diversity of young people living in the Northern Territory.',
																		}),
																	],
																}),
																Object(Bt.jsxs)('li', {
																	style: { marginBottom: 10 },
																	children: [
																		Object(Bt.jsxs)('strong', {
																			children: [
																				'Children\u2019s Ground: ',
																				Object(Bt.jsx)('a', {
																					href: 'https://childrensground.org.au',
																					children: 'Donate',
																				}),
																			],
																		}),
																		Object(Bt.jsx)('p', {
																			children:
																				'Children\u2019s Ground partners with whole communities. Every child born today should experience a lifetime of opportunity, entering adulthood strong in their identity and culture, connected to their local and global world, and economically independent. If all children can experience this basic right, then whole communities will enjoy wellbeing.',
																		}),
																	],
																}),
																Object(Bt.jsxs)('li', {
																	style: { marginBottom: 10 },
																	children: [
																		Object(Bt.jsxs)('strong', {
																			children: [
																				'Watarrka Foundation: ',
																				Object(Bt.jsx)('a', {
																					href: 'http://www.watarrkafoundation.org.au',
																					children: 'Donate',
																				}),
																			],
																		}),
																		Object(Bt.jsx)('p', {
																			children:
																				'The Watarrka Foundation is committed to the creation of thriving, independent and self-reliant aboriginal communities living on their ancestral land. Focussed on young people, we deliver programs that support a sustainable environment, education, healthy lifestyles and independent livelihoods for Aboriginal communities in the Watarrka region.',
																		}),
																	],
																}),
																Object(Bt.jsxs)('li', {
																	style: { marginBottom: 10 },
																	children: [
																		Object(Bt.jsxs)('strong', {
																			children: [
																				'Stars Foundation: ',
																				Object(Bt.jsx)('a', {
																					href: 'https://starsfoundation.org.au/',
																					children: 'Donate',
																				}),
																			],
																		}),
																		Object(Bt.jsx)('p', {
																			children:
																				'Stars supports Indigenous girls and young women to attend school, complete Year 12 and move into full-time work or further study. Our full-time Mentors provide a diverse range of activities to support our Stars to develop the self-esteem, confidence and life skills they need to successfully participate in school and transition into a positive and independent future.',
																		}),
																	],
																}),
															],
														}),
														Object(Bt.jsxs)('p', {
															children: [
																'For individual schools and community groups accepting online donations in lieu of a sizzle, we\u2019re asking them to get in touch via ',
																Object(Bt.jsx)('a', { href: 'https://twitter.com/demsausage', children: 'Twitter' }),
																',',
																' ',
																Object(Bt.jsx)('a', {
																	href: 'https://www.facebook.com/AusDemocracySausage/',
																	children: 'Facebook',
																}),
																',',
																' ',
																Object(Bt.jsx)('a', {
																	href: 'https://www.instagram.com/ausdemocracysausage/',
																	children: 'Instagram',
																}),
																', or',
																' ',
																Object(Bt.jsx)('a', {
																	href: 'mailto:ausdemocracysausage@gmail.com',
																	children: 'email',
																}),
																' so we can help get the word out.',
															],
														}),
														Object(Bt.jsx)('p', {
															children:
																'We\u2019d also love to see some photographs and videos from hungry voters who are celebrating election day by making their own Democracy Sausage at home.',
														}),
														Object(Bt.jsx)('p', {
															children:
																'Finally, for Democracy Sausage enthusiasts voting in person on Saturday, remember to be considerate of your fellow voters and election staff, and to take care of yourselves and your communities.',
														}),
													],
												}),
											o.length > 0 &&
												Object(Bt.jsxs)(Ys.a, {
													open: !0,
													onRequestClose: d,
													title: 'Polling Places',
													actionButton: Object(Bt.jsx)(Fa.a, { label: 'Close', onClick: d }),
													containerStyle: { paddingBottom: 56 },
													children: [
														o.slice(0, 20).map(function (e) {
															return Object(Bt.jsx)(
																yr,
																{ children: Object(Bt.jsx)(Wn, { pollingPlace: e, election: t, showFullCard: !0 }) },
																e.id,
															);
														}),
														o.length > 20 &&
															Object(Bt.jsx)(Kn.ListItem, {
																leftAvatar: Object(Bt.jsx)(Yn.a, {
																	icon: Object(Bt.jsx)(Rt.ActionInfo, {}),
																	backgroundColor: Ie.blue500,
																}),
																primaryText: "There's a lot of polling places here",
																secondaryText: Object(Bt.jsxs)('span', {
																	children: [
																		'Try zooming in on the map and querying again - or hit the ',
																		Object(Bt.jsx)(s.a, { to: '/search', children: 'Find' }),
																		' button and search by an address.',
																	],
																}),
																secondaryTextLines: 2,
																disabled: !0,
															}),
													],
												}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				_r = function (e) {
					return void 0 !== e ? 'Democracy Sausage | '.concat(e.name) : 'Democracy Sausage';
				},
				Sr = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).onOpenFinderForAddressSearch = void 0),
							(a.onOpenFinderForGeolocation = void 0),
							(a.state = { waitingForGeolocation: !1, queriedPollingPlaces: [], mapFilterOptions: {} }),
							(a.onSetQueriedPollingPlaces = a.onSetQueriedPollingPlaces.bind(Object(Ot.a)(a))),
							(a.onClearQueriedPollingPlaces = a.onClearQueriedPollingPlaces.bind(Object(Ot.a)(a))),
							(a.onWaitForGeolocation = a.onWaitForGeolocation.bind(Object(Ot.a)(a))),
							(a.onGeolocationComplete = a.onGeolocationComplete.bind(Object(Ot.a)(a))),
							(a.onGeolocationError = a.onGeolocationError.bind(Object(Ot.a)(a))),
							(a.onClickMapFilterOption = a.onClickMapFilterOption.bind(Object(Ot.a)(a))),
							(a.onOpenFinderForAddressSearch = e.onOpenFinderForAddressSearch.bind(Object(Ot.a)(a))),
							(a.onOpenFinderForGeolocation = e.onOpenFinderForGeolocation.bind(Object(Ot.a)(a))),
							ca.event({
								category: 'SausageMapContainer',
								action: 'geolocationSupported',
								value: e.geolocationSupported ? 1 : 0,
							}),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'onSetQueriedPollingPlaces',
								value: function (e) {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { queriedPollingPlaces: e }));
								},
							},
							{
								key: 'onClearQueriedPollingPlaces',
								value: function () {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { queriedPollingPlaces: [] }));
								},
							},
							{
								key: 'onWaitForGeolocation',
								value: function () {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { waitingForGeolocation: !0 }));
								},
							},
							{
								key: 'onGeolocationComplete',
								value: function (e, t, n) {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { waitingForGeolocation: !1 })),
										this.props.onGeolocationComplete(this.props.currentElection, e, t, n);
								},
							},
							{
								key: 'onGeolocationError',
								value: function () {
									this.setState(Object(v.a)(Object(v.a)({}, this.state), {}, { waitingForGeolocation: !1 }));
								},
							},
							{
								key: 'onClickMapFilterOption',
								value: function (e) {
									var t = !(e in this.state.mapFilterOptions && !0 === this.state.mapFilterOptions[e]);
									this.setState(
										Object(v.a)(
											Object(v.a)({}, this.state),
											{},
											{
												mapFilterOptions: Object(v.a)(
													Object(v.a)({}, this.state.mapFilterOptions),
													{},
													Object(Hs.a)({}, e, t),
												),
											},
										),
									);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props,
										n = t.currentElection,
										a = t.embeddedMap,
										o = t.geolocationSupported,
										c = t.fetchQueriedPollingPlaces,
										s = t.mapSearchResults,
										r = t.onClearMapSearch,
										i = this.state,
										l = i.waitingForGeolocation,
										d = i.queriedPollingPlaces,
										p = i.mapFilterOptions;
									return Object(Bt.jsxs)(yt.Fragment, {
										children: [
											Object(Bt.jsxs)(zt.a, {
												children: [
													Object(Bt.jsx)('title', { children: _r(n) }),
													Object(Bt.jsx)('meta', {
														property: 'og:url',
														content: ''.concat('https://public-legacy.staging.democracysausage.org', '/').concat(D(n)),
													}),
													Object(Bt.jsx)('meta', { property: 'og:title', content: _r(n) }),
													Object(Bt.jsx)('meta', {
														property: 'og:image',
														content: ''
															.concat('https://public-legacy.staging.democracysausage.org/api', '/0.1/map_image/')
															.concat(n.id, '/'),
													}),
												],
											}),
											Object(Bt.jsx)(wr, {
												currentElection: n,
												embeddedMap: a,
												waitingForGeolocation: l,
												queriedPollingPlaces: d,
												geolocationSupported: o,
												mapSearchResults: s,
												mapFilterOptions: p,
												onQueryMap: (function () {
													var t = Object(g.a)(
														x.a.mark(function t(a) {
															var o, s;
															return x.a.wrap(function (t) {
																for (;;)
																	switch ((t.prev = t.next)) {
																		case 0:
																			return (
																				(o = a.map(function (e) {
																					return e.getId();
																				})),
																				(t.next = 3),
																				c(n, o)
																			);
																		case 3:
																			(s = t.sent), e.onSetQueriedPollingPlaces(s);
																		case 5:
																		case 'end':
																			return t.stop();
																	}
															}, t);
														}),
													);
													return function (e) {
														return t.apply(this, arguments);
													};
												})(),
												onCloseQueryMapDialog: function () {
													return e.onClearQueriedPollingPlaces();
												},
												onOpenFinderForAddressSearch: this.onOpenFinderForAddressSearch,
												onOpenFinderForGeolocation: this.onOpenFinderForGeolocation,
												onClearMapSearch: r,
												onClickMapFilterOption: this.onClickMapFilterOption,
											}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.Component);
			(Sr.muiName = 'SausageMapContainer'), (Sr.pageTitle = 'Democracy Sausage'), (Sr.pageBaseURL = '');
			var Er,
				kr,
				Tr,
				Pr,
				Mr,
				Rr,
				Ar,
				Ir,
				Lr,
				Fr,
				Nr,
				Dr,
				Ur,
				Gr,
				Br,
				Wr,
				Vr,
				Hr,
				qr,
				Yr,
				Kr,
				Qr,
				Xr,
				Jr,
				Zr,
				$r,
				ei,
				ti,
				ni,
				ai,
				oi,
				ci = Object(c.c)(
					function (e, t) {
						var n = e.app,
							a = e.elections,
							o = e.map;
						return {
							elections: a.elections,
							currentElection: a.elections.find(function (e) {
								return e.id === a.current_election_id;
							}),
							defaultElection: a.elections.find(function (e) {
								return e.id === a.default_election_id;
							}),
							embeddedMap: n.embedded_map,
							geolocationSupported: n.geolocationSupported,
							mapSearchResults: o.search,
						};
					},
					function (e) {
						return {
							onGeolocationComplete: function (t, n, a, o) {
								e(ke(a)), s.d.push('/search/'.concat(D(t)));
							},
							fetchQueriedPollingPlaces: (function () {
								var t = Object(g.a)(
									x.a.mark(function t(n, a) {
										var o;
										return x.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (
															ca.event({
																category: 'SausageMapContainer',
																action: 'fetchQueriedPollingPlaces',
																label: 'Polling Places Queried',
																value: a.length,
															}),
															(t.next = 3),
															e(Ye(n, a))
														);
													case 3:
														return (
															(o = t.sent),
															ca.event({
																category: 'SausageMapContainer',
																action: 'fetchQueriedPollingPlaces',
																label: 'Polling Places Returned',
																value: o.length,
															}),
															t.abrupt('return', o)
														);
													case 6:
													case 'end':
														return t.stop();
												}
										}, t);
									}),
								);
								return function (e, n) {
									return t.apply(this, arguments);
								};
							})(),
							onOpenFinderForAddressSearch: function () {
								var t;
								ca.event({ category: 'SausageMapContainer', action: 'onOpenFinderForAddressSearch' }),
									e(((t = V.FOCUS_INPUT), { type: ee, pollingPlaceFinderMode: t })),
									s.d.push('/search/'.concat(D(this.props.currentElection)));
							},
							onOpenFinderForGeolocation: function () {
								var t = this.props,
									n = t.geolocationSupported,
									a = t.currentElection;
								!0 === n &&
									(ca.event({
										category: 'SausageMapContainer',
										action: 'onOpenFinderForGeolocation',
										label: 'Clicked the geolocation button',
									}),
									this.onWaitForGeolocation(),
									(function (e, t, n, a) {
										var o = arguments.length > 4 && void 0 !== arguments[4] && arguments[4];
										sa(
											e,
											(function () {
												var a = Object(g.a)(
													x.a.mark(function a(c, r, i) {
														return x.a.wrap(function (a) {
															for (;;)
																switch ((a.prev = a.next)) {
																	case 0:
																		return (
																			void 0 !== n && n(c, r, i),
																			(a.t0 = e),
																			(a.t1 = Se),
																			(a.t2 = c.coords.longitude),
																			(a.t3 = c.coords.latitude),
																			(a.next = 7),
																			e(Qe(t, c.coords.latitude, c.coords.longitude))
																		);
																	case 7:
																		(a.t4 = a.sent),
																			(a.t5 = i),
																			(a.t6 = { lon: a.t2, lat: a.t3, extent: a.t4, formattedAddress: a.t5 }),
																			(a.t7 = (0, a.t1)(a.t6)),
																			(0, a.t0)(a.t7),
																			!0 === o && s.d.push('/'.concat(D(t)));
																	case 13:
																	case 'end':
																		return a.stop();
																}
														}, a);
													}),
												);
												return function (e, t, n) {
													return a.apply(this, arguments);
												};
											})(),
											a,
										);
									})(e, a, this.onGeolocationComplete, this.onGeolocationError));
							},
							onClearMapSearch: function () {
								e(Ee());
							},
						};
					},
				)(Sr),
				si = wt.a.div(
					Er ||
						(Er = Object(Ct.a)([
							'\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n  height: 100%;\n',
						])),
				),
				ri = wt.a.div(
					kr ||
						(kr = Object(Ct.a)([
							'\n  width: 70%;\n  max-width: 300px;\n  text-align: center;\n  align-items: start;\n  opacity: 0.5;\n\n  & > div:first-child > * {\n    width: 125px !important;\n    height: 125px !important;\n  }\n\n  & > div:last-child {\n    margin-top: -5px;\n  }\n',
						])),
				),
				ii = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.message,
										n = e.icon;
									return Object(Bt.jsx)(si, {
										children: Object(Bt.jsxs)(ri, {
											children: [Object(Bt.jsx)('div', { children: n }), Object(Bt.jsx)('div', { children: t })],
										}),
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				li = wt.a.div(Tr || (Tr = Object(Ct.a)(['\n  padding: 20px;\n']))),
				di = Object(wt.a)(Pt.m)(Pr || (Pr = Object(Ct.a)(['\n  margin-top: 20px;\n']))),
				pi = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).onViewOnMap = void 0),
							(a.onViewOnMap = function (t) {
								return e.onViewOnMap(e.election, e.pollingPlace);
							}),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.pollingPlace,
										n = e.election;
									return Object(Bt.jsxs)(li, {
										children: [
											Object(Bt.jsx)(Wn, { pollingPlace: t, election: n, showFullCard: !0 }),
											Object(Bt.jsx)(di, { label: 'View on Map', primary: !0, onClick: this.onViewOnMap }),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				ui = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).fetchPollingPlace = void 0),
							(a.state = { pollingPlace: void 0 }),
							(a.fetchPollingPlace = function (t) {
								return e.fetchPollingPlace(t);
							}),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'UNSAFE_componentWillMount',
								value: (function () {
									var e = Object(g.a)(
										x.a.mark(function e() {
											var t;
											return x.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																if (((t = this.props.election), void 0 === this.props.election)) {
																	e.next = 8;
																	break;
																}
																return (e.t0 = this), (e.next = 5), this.fetchPollingPlace(t);
															case 5:
																(e.t1 = e.sent), (e.t2 = { pollingPlace: e.t1 }), e.t0.setState.call(e.t0, e.t2);
															case 8:
															case 'end':
																return e.stop();
														}
												},
												e,
												this,
											);
										}),
									);
									return function () {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.onViewOnMap,
										a = this.state.pollingPlace;
									return void 0 === t || void 0 === a
										? null
										: null === a
											? Object(Bt.jsx)(ii, {
													message: Object(Bt.jsxs)('div', {
														children: [
															"Sorry about this, but we couldn't",
															Object(Bt.jsx)('br', {}),
															'find that polling place.',
														],
													}),
													icon: Object(Bt.jsx)(Rt.ActionSearch, {}),
												})
											: Object(Bt.jsx)(pi, { pollingPlace: a, election: t, onViewOnMap: n });
								},
							},
						]),
						n
					);
				})(yt.Component),
				mi = Object(c.c)(
					function (e, t) {
						return { election: I(e)(t.routeParams.electionName) };
					},
					function (e, t) {
						return {
							fetchPollingPlace: (function () {
								var n = Object(g.a)(
									x.a.mark(function n(a) {
										var o;
										return x.a.wrap(function (n) {
											for (;;)
												switch ((n.prev = n.next)) {
													case 0:
														if (!('stallId' in (o = t.routeParams))) {
															n.next = 5;
															break;
														}
														return (n.next = 4), e(Ze(a, o.stallId));
													case 4:
														return n.abrupt('return', n.sent);
													case 5:
														if (!('ecId' in o)) {
															n.next = 9;
															break;
														}
														return (n.next = 8), e(Je(a, o.ecId));
													case 8:
														return n.abrupt('return', n.sent);
													case 9:
														if (!('name' in o && 'premises' in o && 'state' in o)) {
															n.next = 13;
															break;
														}
														return (n.next = 12), e(Xe(a, o.name, o.premises, o.state));
													case 12:
														return n.abrupt('return', n.sent);
													case 13:
														return n.abrupt('return', null);
													case 14:
													case 'end':
														return n.stop();
												}
										}, n);
									}),
								);
								return function (e) {
									return n.apply(this, arguments);
								};
							})(),
							onViewOnMap: function (t, n) {
								e(Se({ lon: n.geom.coordinates[0], lat: n.geom.coordinates[1], extent: null, formattedAddress: '' })),
									s.d.push('/'.concat(D(t)));
							},
						};
					},
				)(ui),
				ji = n(2377),
				fi = n(2370),
				hi = n(2379),
				bi = n(2372),
				Oi = n(2375),
				xi = n(2376),
				gi = ['transparent', '#6740B4', '#DCE775', '#8BC34A', '#00796B', '#006064'],
				yi = {
					fontFamily: "'Roboto', 'Helvetica Neue', Helvetica, sans-serif",
					fontSize: 12,
					letterSpacing: 'normal',
					padding: 8,
					fill: '#455A64',
					stroke: 'transparent',
					strokeWidth: 0,
				},
				vi = Object(v.a)(Object(v.a)({}, yi), {}, { textAnchor: 'start' }),
				zi = Object(v.a)(
					Object(v.a)({}, xi.a.grayscale),
					{},
					{
						pie: Object(v.a)(
							Object(v.a)({}, { props: {} }),
							{},
							{
								colorScale: gi,
								style: {
									data: { stroke: '#351B69', strokeWidth: 1.5 },
									labels: Object(v.a)(Object(v.a)({}, vi), {}, { padding: 0 }),
								},
							},
						),
					},
				),
				Ci = wt.a.div(
					Mr || (Mr = Object(Ct.a)(['\n  padding-top: 10px;\n  padding-left: 10px;\n  padding-right: 10px;\n'])),
				),
				wi = wt.a.div(
					Rr ||
						(Rr = Object(Ct.a)([
							'\n  display: flex;\n  align-items: flex-start;\n  flex-wrap: wrap;\n  height: 100%;\n  min-width: 30%;\n  max-width: 600px;\n  justify-content: center;\n',
						])),
				),
				_i = Object(wt.a)(wi)(Ar || (Ar = Object(Ct.a)(['\n  margin-bottom: 20px;\n  align-items: stretch;\n']))),
				Si = wt.a.div(
					Ir ||
						(Ir = Object(Ct.a)([
							'\n  width: 30%;\n  vertical-align: middle;\n  text-align: right;\n  padding-right: 10px;\n  font-size: 22px;\n',
						])),
				),
				Ei = wt.a.div(
					Lr ||
						(Lr = Object(Ct.a)([
							'\n  background-color: #e8bb3c;\n  text-align: center;\n  align-items: center;\n  justify-content: center;\n  display: flex;\n',
						])),
				),
				ki = wt.a.h2(
					Fr ||
						(Fr = Object(Ct.a)([
							'\n  font-size: 50px;\n  margin-top: 10px;\n  margin-bottom: 10px;\n  padding-left: 10px;\n  padding-right: 10px;\n',
						])),
				),
				Ti = wt.a.div(
					Nr ||
						(Nr = Object(Ct.a)([
							'\n  /* text-align: center; */\n  /* align-items: start; */\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 18px;\n  margin-top: -3px;\n  text-align: center;\n\n  background-color: #e8bb3c;\n  color: #292336;\n  padding: 10px 10%;\n  border-top-left-radius: 50%;\n  border-top-right-radius: 50%;\n',
						])),
				),
				Pi = wt.a.div(
					Dr ||
						(Dr = Object(Ct.a)([
							'\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  /* Or do it all in one line with flex flow */\n  /* flex-flow: row wrap; */\n  /* tweak where items line up on the row valid values are: \n       flex-start, flex-end, space-between, space-around, stretch */\n  /* align-content: flex-end; */\n  /* margin-bottom: 20px; */\n',
						])),
				),
				Mi = Object(wt.a)(wi)(
					Ur ||
						(Ur = Object(Ct.a)([
							'\n  margin-bottom: 20px;\n  align-items: stretch;\n  background-color: #e8bb3c;\n  color: #292336;\n  max-width: 100%;\n  margin-bottom: 20px;\n',
						])),
				),
				Ri = wt.a.h3(
					Gr ||
						(Gr = Object(Ct.a)([
							'\n  margin-top: 0px;\n  margin-bottom: 0px;\n  padding: 20px;\n  display: inline-block;\n  color: white;\n\n  & a,\n  a:visited {\n    color: black;\n  }\n',
						])),
				),
				Ai = wt.a.h2(
					Br ||
						(Br = Object(Ct.a)([
							'\n  margin-top: 0px;\n  margin-bottom: 20px;\n  background-color: #e8bb3c;\n  color: #292336;\n  padding: 20px 10%;\n',
						])),
				),
				Ii = Object(wt.a)(Ai)(Wr || (Wr = Object(Ct.a)(['\n  padding: 5px 5%;\n']))),
				Li = wt.a.div(Vr || (Vr = Object(Ct.a)(['\n  position: relative;\n']))),
				Fi = wt.a.div(
					Hr ||
						(Hr = Object(Ct.a)([
							'\n  position: relative;\n  min-width: 280px;\n  max-width: 300px;\n  max-height: 200px;\n  margin: 10px;\n',
						])),
				),
				Ni = Object(wt.a)(Pt.o)(
					qr ||
						(qr = Object(Ct.a)([
							'\n  max-width: 600px;\n  margin-bottom: 40px;\n\n  & td {\n    text-overflow: clip !important;\n  }\n',
						])),
				),
				Di = wt.a.div(Yr || (Yr = Object(Ct.a)(['\n  font-size: 12px;\n  margin: 10px;\n']))),
				Ui = function (e) {
					var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0,
						n = e.data.all_booths_by_noms.bbq.expected_voters / e.data.all_booths.expected_voters,
						a = [
							{ x: 'without_sausage_access', y: 1 - n },
							{ x: 'with_sausage_access', y: n },
						];
					return Object(Bt.jsxs)(yt.Fragment, {
						children: [
							Object(Bt.jsx)(ji.a, {
								data: a,
								padding: 20,
								innerRadius: 150,
								startAngle: 90,
								endAngle: -90,
								style: { parent: { maxHeight: '300px' } },
								theme: zi,
								labels: [''],
							}),
							Object(Bt.jsxs)(Ti, {
								style: t,
								children: [
									Object(Bt.jsx)('strong', { children: e.domain }),
									Object(Bt.jsx)('br', {}),
									new Intl.NumberFormat('en-AU').format(e.data.all_booths_by_noms.bbq.expected_voters),
									' (',
									new Intl.NumberFormat('en-AU', { style: 'percent', minimumFractionDigits: 1 }).format(n),
									')',
								],
							}),
						],
					});
				},
				Gi = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'groupStateStatsByNoms',
								value: function () {
									var e = this.props.stats,
										t = [];
									return (
										e.states.forEach(function (e) {
											for (var n = 0, a = Object.entries(e.data.all_booths_by_noms); n < a.length; n++) {
												var o = Object(le.a)(a[n], 2),
													c = o[0],
													s = o[1];
												c in t || (t[c] = []), t[c].push({ x: e.domain, y: s.booth_count });
											}
										}),
										t
									);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props.stats,
										t = this.groupStateStatsByNoms();
									return Object(Bt.jsxs)(Ci, {
										children: [
											Object(Bt.jsx)(Pi, {
												children: Object(Bt.jsx)(Mi, {
													children: Object(Bt.jsxs)(Ri, {
														children: [
															Object(Bt.jsx)('a', {
																href: '#expected_sausage_access',
																children: 'Voters with access to #democracysausage',
															}),
															' |',
															' ',
															Object(Bt.jsx)('a', {
																href: '#the_best_and_wurst',
																children: 'Best & Wurst electorates with #democracysausage on offer',
															}),
															' |',
															' ',
															Object(Bt.jsx)('a', {
																href: '#whos_got_what_by_state',
																children: "Who's got what by state",
															}),
														],
													}),
												}),
											}),
											Object(Bt.jsx)(Pi, {
												children: Object(Bt.jsxs)(_i, {
													children: [
														Object(Bt.jsx)(Si, { children: 'Polling booths with sausage sizzles' }),
														Object(Bt.jsx)(Ei, {
															children: Object(Bt.jsx)(ki, {
																children: e.australia.data.all_booths_by_noms.bbq.booth_count,
															}),
														}),
													],
												}),
											}),
											Object(Bt.jsxs)(Pi, {
												children: [
													Object(Bt.jsx)(Ai, {
														id: 'expected_sausage_access',
														children: 'Expected % of voters with access to #democracysausage',
													}),
													Object(Bt.jsx)(Li, {
														style: { minWidth: '30%', maxWidth: '500px' },
														children: Ui(e.australia, {
															borderTopLeftRadius: 'unset',
															borderTopRightRadius: 'unset',
															top: '70%',
														}),
													}),
													Object(Bt.jsx)(wi, {
														children: e.states.map(function (e) {
															return Object(Bt.jsx)(Fi, { children: Ui(e) }, e.domain);
														}),
													}),
												],
											}),
											Object(Bt.jsxs)(Pi, {
												children: [
													Object(Bt.jsx)(Ai, {
														id: 'the_best_and_wurst',
														children: 'By electorate - Expected % of voters with access to #democracysausage',
													}),
													Object(Bt.jsx)(Ii, {
														children: 'Leaders of the Sizzling Award for commitment to #democracysausage',
													}),
													Object(Bt.jsx)(wi, {
														children: Object(Bt.jsx)(Ni, {
															selectable: !1,
															children: Object(Bt.jsx)(Pt.p, {
																displayRowCheckbox: !1,
																children: e.divisions.top.map(function (e) {
																	return Object(Bt.jsxs)(
																		Pt.s,
																		{
																			children: [
																				Object(Bt.jsxs)(Pt.t, {
																					style: { width: '40px' },
																					children: [e.metadata.rank, '.'],
																				}),
																				Object(Bt.jsx)(Pt.t, { children: e.domain }),
																				Object(Bt.jsx)(Pt.t, { children: e.metadata.state }),
																				Object(Bt.jsx)(Pt.t, {
																					children: new Intl.NumberFormat('en-AU', {
																						style: 'percent',
																						minimumFractionDigits: 1,
																					}).format(
																						e.data.all_booths_by_noms.bbq.expected_voters /
																							e.data.all_booths.expected_voters,
																					),
																				}),
																			],
																		},
																		e.domain,
																	);
																}),
															}),
														}),
													}),
													Object(Bt.jsx)(Ii, { children: 'The Wurst' }),
													Object(Bt.jsx)(wi, {
														children: Object(Bt.jsx)(Ni, {
															selectable: !1,
															children: Object(Bt.jsx)(Pt.p, {
																displayRowCheckbox: !1,
																children: e.divisions.bottom.map(function (e) {
																	return Object(Bt.jsxs)(
																		Pt.s,
																		{
																			children: [
																				Object(Bt.jsxs)(Pt.t, {
																					style: { width: '40px' },
																					children: [e.metadata.rank, '.'],
																				}),
																				Object(Bt.jsx)(Pt.t, { children: e.domain }),
																				Object(Bt.jsx)(Pt.t, { children: e.metadata.state }),
																				Object(Bt.jsx)(Pt.t, {
																					children: new Intl.NumberFormat('en-AU', {
																						style: 'percent',
																						minimumFractionDigits: 1,
																					}).format(
																						e.data.all_booths_by_noms.bbq.expected_voters /
																							e.data.all_booths.expected_voters,
																					),
																				}),
																			],
																		},
																		e.domain,
																	);
																}),
															}),
														}),
													}),
												],
											}),
											Object(Bt.jsxs)(Pi, {
												children: [
													Object(Bt.jsx)(Ai, {
														id: 'whos_got_what_by_state',
														children: "By state - Who's got what stalls",
													}),
													Object(Bt.jsx)(wi, {
														children: Object(Bt.jsx)(fi.a, {
															height: 1400,
															domainPadding: { x: 60, y: 50 },
															children: Object(Bt.jsx)(hi.a, {
																offset: 20,
																padding: 50,
																horizontal: !0,
																colorScale: 'qualitative',
																children: Object.keys(t).map(function (e) {
																	return Object(Bt.jsx)(
																		bi.a,
																		{
																			data: t[e],
																			categories: { x: ['ACT', 'NT', 'TAS', 'WA', 'SA', 'QLD', 'VIC', 'NSW'] },
																			barWidth: 20,
																			labels: function (t) {
																				var n = t.datum;
																				return ''.concat(n.y, ' ').concat(e.replace(/_/g, ' '));
																			},
																			style: { labels: { fill: 'black' } },
																			labelComponent: Object(Bt.jsx)(Oi.a, {}),
																		},
																		'byNomsByState-'.concat(e),
																	);
																}),
															}),
														}),
													}),
												],
											}),
											Object(Bt.jsxs)(Di, {
												children: [
													Object(Bt.jsx)('strong', { children: 'Note on expected percentage of voters:' }),
													Object(Bt.jsx)('br', {}),
													'The expected percentage of voters with access to sausage is calculated by comparing the number of expected voters at polling places which have sausage with the overall expected voters for that state/territory.',
													Object(Bt.jsx)('br', {}),
													'Expected voters comes from AEC Expected election day polling places data, available',
													' ',
													Object(Bt.jsx)('a', {
														href: 'https://www.aec.gov.au/About_AEC/cea-notices/election-pp.htm',
														children: 'here',
													}),
													'.',
													Object(Bt.jsx)('br', {}),
													'As the expected voters relate to election day polling places, pre-poll and postal voters are excluded from the expected voters total calculation.',
													Object(Bt.jsx)('br', {}),
													"For polling places with multiple divisions, the expected voters count towards the 'home' division.",
												],
											}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Bi = wt.a.div(
					Kr || (Kr = Object(Ct.a)(['\n  padding-top: 10px;\n  padding-left: 10px;\n  padding-right: 10px;\n'])),
				),
				Wi = wt.a.div(
					Qr ||
						(Qr = Object(Ct.a)([
							'\n  display: flex;\n  align-items: flex-start;\n  flex-wrap: wrap;\n  height: 100%;\n  min-width: 30%;\n  max-width: 600px;\n  justify-content: center;\n',
						])),
				),
				Vi = Object(wt.a)(Wi)(Xr || (Xr = Object(Ct.a)(['\n  margin-bottom: 20px;\n  align-items: stretch;\n']))),
				Hi = wt.a.div(
					Jr ||
						(Jr = Object(Ct.a)([
							'\n  width: 30%;\n  vertical-align: middle;\n  text-align: right;\n  padding-right: 10px;\n  font-size: 22px;\n',
						])),
				),
				qi = wt.a.div(
					Zr ||
						(Zr = Object(Ct.a)([
							'\n  background-color: #e8bb3c;\n  text-align: center;\n  align-items: center;\n  justify-content: center;\n  display: flex;\n',
						])),
				),
				Yi = wt.a.h2(
					$r ||
						($r = Object(Ct.a)([
							'\n  font-size: 50px;\n  margin-top: 10px;\n  margin-bottom: 10px;\n  padding-left: 10px;\n  padding-right: 10px;\n',
						])),
				),
				Ki = wt.a.div(
					ei ||
						(ei = Object(Ct.a)([
							'\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  /* Or do it all in one line with flex flow */\n  /* flex-flow: row wrap; */\n  /* tweak where items line up on the row valid values are: \n       flex-start, flex-end, space-between, space-around, stretch */\n  /* align-content: flex-end; */\n  /* margin-bottom: 20px; */\n',
						])),
				),
				Qi = wt.a.h2(
					ti ||
						(ti = Object(Ct.a)([
							'\n  margin-top: 0px;\n  margin-bottom: 20px;\n  background-color: #e8bb3c;\n  color: #292336;\n  padding: 20px 10%;\n',
						])),
				),
				Xi = Object(wt.a)(Qi)(ni || (ni = Object(Ct.a)(['\n  padding: 5px 5%;\n']))),
				Ji = Object(wt.a)(Pt.o)(ai || (ai = Object(Ct.a)(['\n  max-width: 600px;\n']))),
				Zi = Object(wt.a)(Pt.r)(
					oi || (oi = Object(Ct.a)(['\n  color: black !important;\n  font-weight: bold !important;\n'])),
				),
				$i = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.stats;
									return Object(Bt.jsxs)(Bi, {
										children: [
											Object(Bt.jsx)(Ki, {
												children: Object(Bt.jsxs)(Vi, {
													children: [
														Object(Bt.jsx)(Hi, { children: 'Polling booths with sausage sizzles' }),
														Object(Bt.jsx)(qi, {
															children: Object(Bt.jsx)(Yi, {
																children: e.state.data.all_booths_by_noms.bbq.booth_count,
															}),
														}),
													],
												}),
											}),
											Object(Bt.jsxs)(Ki, {
												children: [
													Object(Bt.jsx)(Xi, {
														style: { marginBottom: 10, marginTop: 20 },
														children: "What's available at stalls",
													}),
													Object(Bt.jsx)(Wi, {
														children: Object(Bt.jsxs)(Ji, {
															selectable: !1,
															children: [
																Object(Bt.jsx)(Pt.q, {
																	displaySelectAll: !1,
																	adjustForCheckbox: !1,
																	children: Object(Bt.jsxs)(Pt.s, {
																		children: [
																			Object(Bt.jsx)(Zi, { children: 'Noms' }),
																			Object(Bt.jsx)(Zi, { children: '# of booths' }),
																			Object(Bt.jsx)(Zi, { children: '% of all booths' }),
																		],
																	}),
																}),
																Object(Bt.jsx)(Pt.p, {
																	displayRowCheckbox: !1,
																	children: Object.keys(e.state.data.all_booths_by_noms).map(function (t) {
																		return Object(Bt.jsxs)(
																			Pt.s,
																			{
																				children: [
																					Object(Bt.jsx)(Pt.t, { children: t.replace(/_/g, ' ') }),
																					Object(Bt.jsx)(Pt.t, {
																						children: e.state.data.all_booths_by_noms[t].booth_count,
																					}),
																					Object(Bt.jsx)(Pt.t, {
																						children:
																							e.state.data.all_booths.booth_count > 0 &&
																							new Intl.NumberFormat('en-AU', {
																								style: 'percent',
																								minimumFractionDigits: 1,
																							}).format(
																								e.state.data.all_booths_by_noms[t].booth_count /
																									e.state.data.all_booths.booth_count,
																							),
																					}),
																				],
																			},
																			t,
																		);
																	}),
																}),
															],
														}),
													}),
												],
											}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				el = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return (
							Object(je.a)(this, n),
							((a = t.call(this, e)).fetchStats = void 0),
							(a.state = { stats: void 0 }),
							(a.fetchStats = function (t) {
								return e.fetchStats(t);
							}),
							a
						);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'UNSAFE_componentWillMount',
								value: (function () {
									var e = Object(g.a)(
										x.a.mark(function e() {
											var t;
											return x.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																if (void 0 === (t = this.props.currentElection)) {
																	e.next = 8;
																	break;
																}
																return (e.t0 = this), (e.next = 5), this.fetchStats(t);
															case 5:
																(e.t1 = e.sent), (e.t2 = { stats: e.t1 }), e.t0.setState.call(e.t0, e.t2);
															case 8:
															case 'end':
																return e.stop();
														}
												},
												e,
												this,
											);
										}),
									);
									return function () {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'render',
								value: function () {
									var e = this.props.currentElection,
										t = this.state.stats;
									return void 0 === t
										? null
										: null === t
											? Object(Bt.jsx)('div', { children: 'No stats are available for this election \ud83d\ude22' })
											: 27 === e.id || 37 === e.id || 53 === e.id
												? Object(Bt.jsx)(Gi, { election: e, stats: t })
												: Object(Bt.jsx)($i, { election: e, stats: t });
								},
							},
						]),
						n
					);
				})(yt.Component);
			(el.muiName = 'SausagelyticsContainer'),
				(el.pageTitle = 'Democracy Sausage | Charts, graphs, and data!'),
				(el.pageBaseURL = '/sausagelytics');
			var tl,
				nl,
				al,
				ol,
				cl,
				sl,
				rl,
				il,
				ll,
				dl,
				pl,
				ul,
				ml = Object(c.c)(
					function (e) {
						var t = e.elections;
						return {
							currentElection: t.elections.find(function (e) {
								return e.id === t.current_election_id;
							}),
						};
					},
					function (e) {
						return {
							fetchStats: (function () {
								var t = Object(g.a)(
									x.a.mark(function t(n) {
										return x.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(N(n));
													case 2:
														return t.abrupt('return', t.sent);
													case 3:
													case 'end':
														return t.stop();
												}
										}, t);
									}),
								);
								return function (e) {
									return t.apply(this, arguments);
								};
							})(),
						};
					},
				)(el),
				jl = wt.a.div(tl || (tl = Object(Ct.a)(['\n  padding-left: 10px;\n  padding-right: 10px;\n']))),
				fl = wt.a.div(
					nl ||
						(nl = Object(Ct.a)([
							'\n  display: flex;\n  flex-direction: row;\n  align-items: left;\n  justify-content: left;\n  /* Or do it all in one line with flex flow */\n  flex-flow: row wrap;\n  /* tweak where items line up on the row valid values are: \n       flex-start, flex-end, space-between, space-around, stretch */\n  align-content: flex-end;\n  /* margin-bottom: -4px; */\n',
						])),
				),
				hl = Object(wt.a)(fl)(
					al ||
						(al = Object(Ct.a)([
							'\n  background-color: rgb(61, 61, 61);\n  color: white;\n  padding: 10px;\n  margin-bottom: 3px;\n',
						])),
				),
				bl = wt.a.div(
					ol ||
						(ol = Object(Ct.a)([
							'\n  /* text-align: center; */\n  /* align-items: start; */\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 18px;\n  margin-top: -3px;\n',
						])),
				),
				Ol = wt.a.div(cl || (cl = Object(Ct.a)(['\n  width: 10%;\n']))),
				xl = wt.a.div(
					sl ||
						(sl = Object(Ct.a)([
							'\n  /* max-width: 500px; */\n  width: 60%;\n\n  & h5 {\n    margin-top: 5px;\n    text-transform: uppercase;\n  }\n\n  & h2 {\n    margin-bottom: 5px;\n  }\n',
						])),
				),
				gl = wt.a.div(rl || (rl = Object(Ct.a)(['\n  max-width: 500px;\n  width: 80%;\n  margin-right: 10px;\n']))),
				yl = wt.a.div(il || (il = Object(Ct.a)(['\n  /* margin-right: 10px; */\n']))),
				vl = wt.a.div(
					ll ||
						(ll = Object(Ct.a)([
							'\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  /* Or do it all in one line with flex flow */\n  /* flex-flow: row wrap; */\n  /* tweak where items line up on the row valid values are: \n       flex-start, flex-end, space-between, space-around, stretch */\n  /* align-content: flex-end; */\n  /* margin-bottom: 20px; */\n',
						])),
				),
				zl = wt.a.div(dl || (dl = Object(Ct.a)(['\n  margin-bottom: 20px;\n  font-weight: bold;\n']))),
				Cl = wt.a.div(pl || (pl = Object(Ct.a)(['\n  position: relative;\n']))),
				wl = wt.a.div(
					ul ||
						(ul = Object(Ct.a)([
							'\n  /* text-align: center; */\n  /* align-items: start; */\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 28px;\n  color: #fbc02d;\n',
						])),
				),
				_l = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.currentElection;
									console.log(e);
									var t = [
										{ x: 1, y: 3.1 },
										{ x: 2, y: 6.9 },
									];
									return Object(Bt.jsxs)(jl, {
										children: [
											Object(Bt.jsxs)(vl, {
												children: [
													Object(Bt.jsx)(zl, { children: 'Booths Reported' }),
													Object(Bt.jsxs)(Cl, {
														children: [
															Object(Bt.jsx)('svg', {
																viewBox: '0 0 120 120',
																style: { width: 120, height: 120, position: 'relative', transform: 'rotate(0.75turn)' },
																children: Object(Bt.jsx)('circle', {
																	cx: '60',
																	cy: '60',
																	r: '57.5',
																	fill: 'none',
																	strokeWidth: '5',
																	strokeMiterlimit: '20',
																	style: {
																		stroke: '#FBC02D',
																		strokeLinecap: 'round',
																		transition: 'all 0.3s linear 0ms',
																		strokeDasharray: '110.993, 361.283',
																	},
																}),
															}),
															Object(Bt.jsx)(wl, { children: '351' }),
														],
													}),
												],
											}),
											Object(Bt.jsx)(bi.a, {
												style: { data: { fill: '#c43a31' }, labels: { fill: 'white' } },
												data: [
													{ x: 1, y: 2, width: 25 },
													{ x: 2, y: 3, width: 25 },
													{ x: 3, y: 5, width: 25 },
													{ x: 4, y: 4, width: 25 },
													{ x: 5, y: 6, width: 25 },
												],
												labels: function (e) {
													return e.y;
												},
												labelComponent: Object(Bt.jsx)(Oi.a, { dy: 30, children: 'CoffeeIcon' }),
											}),
											Object(Bt.jsxs)(hl, {
												children: [
													Object(Bt.jsxs)(xl, {
														children: [
															Object(Bt.jsx)('h5', { children: 'Sausage Sizzles' }),
															Object(Bt.jsx)('h2', { children: '35.2%' }),
															Object(Bt.jsx)(Oo.a, {
																mode: 'determinate',
																value: 350,
																max: 651,
																color: '#62c175',
																style: { backgroundColor: 'rgb(43, 43, 43)', height: '2px' },
															}),
														],
													}),
													Object(Bt.jsx)(Ol, {}),
													Object(Bt.jsxs)(Cl, {
														style: { width: '30%' },
														children: [
															Object(Bt.jsx)(ji.a, {
																innerRadius: 140,
																padAngle: 3,
																data: t,
																colorScale: ['#62c175', 'rgb(43, 43, 43)'],
																padding: 10,
															}),
															Object(Bt.jsx)(bl, { children: '351' }),
														],
													}),
												],
											}),
											Object(Bt.jsxs)(hl, {
												children: [
													Object(Bt.jsxs)(xl, {
														children: [
															Object(Bt.jsx)('h5', { children: 'Cake Stalls' }),
															Object(Bt.jsx)('h2', { children: '35.2%' }),
															Object(Bt.jsx)(Oo.a, {
																mode: 'determinate',
																value: 350,
																max: 651,
																color: '#62c175',
																style: { backgroundColor: 'rgb(43, 43, 43)', height: '2px' },
															}),
														],
													}),
													Object(Bt.jsx)(Ol, {}),
													Object(Bt.jsxs)(Cl, {
														style: { width: '30%' },
														children: [
															Object(Bt.jsx)(ji.a, {
																innerRadius: 140,
																padAngle: 3,
																data: t,
																colorScale: ['#62c175', 'rgb(43, 43, 43)'],
																padding: 10,
															}),
															Object(Bt.jsx)(bl, { children: '351' }),
														],
													}),
												],
											}),
											Object(Bt.jsx)('br', {}),
											Object(Bt.jsx)('br', {}),
											Object(Bt.jsxs)(vl, {
												children: [
													Object(Bt.jsx)(zl, { children: 'Cake Stalls' }),
													Object(Bt.jsxs)(Cl, {
														children: [
															Object(Bt.jsx)('svg', {
																viewBox: '0 0 120 120',
																style: { width: 120, height: 120, position: 'relative', transform: 'rotate(0.75turn)' },
																children: Object(Bt.jsx)('circle', {
																	cx: '60',
																	cy: '60',
																	r: '57.5',
																	fill: 'none',
																	strokeWidth: '5',
																	strokeMiterlimit: '20',
																	style: {
																		stroke: '#FBC02D',
																		strokeLinecap: 'round',
																		transition: 'all 0.3s linear 0ms',
																		strokeDasharray: '110.993, 361.283',
																	},
																}),
															}),
															Object(Bt.jsx)(wl, { children: Object(Bt.jsx)(qt, {}) }),
														],
													}),
												],
											}),
											Object(Bt.jsx)('br', {}),
											Object(Bt.jsxs)(fl, {
												style: { marginBottom: 10 },
												children: [
													Object(Bt.jsx)(gl, {
														children: Object(Bt.jsx)(Oo.a, {
															mode: 'determinate',
															value: 350,
															max: 651,
															style: { height: 50 },
														}),
													}),
													Object(Bt.jsx)(yl, {
														children: Object(Bt.jsx)(Rt.ActionHome, { style: { width: 30, height: 30 } }),
													}),
												],
											}),
											Object(Bt.jsxs)(fl, {
												children: [
													Object(Bt.jsx)(gl, {
														children: Object(Bt.jsx)(Oo.a, {
															mode: 'determinate',
															value: 340,
															max: 651,
															style: { height: 30 },
														}),
													}),
													Object(Bt.jsx)(yl, { children: Object(Bt.jsx)(en, { style: { width: 30, height: 30 } }) }),
												],
											}),
											Object(Bt.jsxs)(fl, {
												children: [
													Object(Bt.jsx)(gl, {
														children: Object(Bt.jsx)(Oo.a, {
															mode: 'determinate',
															value: 220,
															max: 651,
															style: { height: 30 },
														}),
													}),
													Object(Bt.jsx)(yl, { children: Object(Bt.jsx)(qt, { style: { width: 30, height: 30 } }) }),
												],
											}),
											Object(Bt.jsxs)(fl, {
												children: [
													Object(Bt.jsx)(gl, {
														children: Object(Bt.jsx)(Oo.a, {
															mode: 'determinate',
															value: 110,
															max: 651,
															style: { height: 30 },
														}),
													}),
													Object(Bt.jsx)(yl, { children: Object(Bt.jsx)(Vt, { style: { width: 30, height: 30 } }) }),
												],
											}),
											Object(Bt.jsxs)(fl, {
												children: [
													Object(Bt.jsx)(gl, {
														children: Object(Bt.jsx)(Oo.a, {
															mode: 'determinate',
															value: 75,
															max: 651,
															style: { height: 30 },
														}),
													}),
													Object(Bt.jsx)(yl, { children: Object(Bt.jsx)(Kt, { style: { width: 30, height: 30 } }) }),
												],
											}),
											Object(Bt.jsxs)(fl, {
												children: [
													Object(Bt.jsx)(gl, {
														children: Object(Bt.jsx)(Oo.a, {
															mode: 'determinate',
															value: 45,
															max: 651,
															style: { height: 30 },
														}),
													}),
													Object(Bt.jsx)(yl, { children: Object(Bt.jsx)(yn, { style: { width: 30, height: 30 } }) }),
												],
											}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.PureComponent),
				Sl = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n(e) {
						var a;
						return Object(je.a)(this, n), ((a = t.call(this, e)).state = {}), a;
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.currentElection;
									return Object(Bt.jsx)(_l, { currentElection: e });
								},
							},
						]),
						n
					);
				})(yt.Component);
			(Sl.muiName = 'SausagelyticsContainer_v1'),
				(Sl.pageTitle = 'Democracy Sausage | Charts, graphs, and data!'),
				(Sl.pageBaseURL = '/sausagelytics');
			var El,
				kl,
				Tl,
				Pl,
				Ml = Object(c.c)(
					function (e) {
						var t = e.elections;
						return {
							currentElection: t.elections.find(function (e) {
								return e.id === t.current_election_id;
							}),
						};
					},
					function (e) {
						return {};
					},
				)(Sl),
				Rl = wt.a.div(El || (El = Object(Ct.a)(['\n  padding-left: 15px;\n  padding-right: 15px;\n']))),
				Al = wt.a.h3(
					kl ||
						(kl = Object(Ct.a)([
							'\n  margin-bottom: 5px;\n  border-bottom: 1px solid ',
							';\n  padding-bottom: 5px;\n',
						])),
					Ie.grey300,
				),
				Il = wt.a.div(
					Tl ||
						(Tl = Object(Ct.a)([
							'\n  margin-bottom: 25px;\n  font-size: 14px;\n  line-height: 24px;\n  color: ',
							';\n  width: 75%;\n\n  & > p {\n    margin-top: 5px;\n    margin-bottom: 5px;\n  }\n\n  & li {\n    margin-bottom: 5px;\n  }\n',
						])),
					Ie.grey800,
				),
				Ll = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Bt.jsxs)(yt.Fragment, {
										children: [
											Object(Bt.jsxs)(zt.a, {
												children: [
													Object(Bt.jsx)('title', { children: 'Democracy Sausage | FAQs and About Us' }),
													Object(Bt.jsx)('meta', {
														property: 'og:url',
														content: ''.concat('https://public-legacy.staging.democracysausage.org', '/about'),
													}),
													Object(Bt.jsx)('meta', {
														property: 'og:title',
														content: 'Democracy Sausage | FAQs and About Us',
													}),
												],
											}),
											Object(Bt.jsxs)(Rl, {
												children: [
													Object(Bt.jsx)(Al, { children: 'What is this?' }),
													Object(Bt.jsx)(Il, { children: 'A map of sausage and cake availability on election day.' }),
													Object(Bt.jsx)(Al, { children: "I still don't understand" }),
													Object(Bt.jsx)(Il, {
														children: "It's practically part of the Australian Constitution. Or something.",
													}),
													Object(Bt.jsx)(Al, { children: 'But how do you get all of the sausage sizzles?' }),
													Object(Bt.jsxs)(Il, {
														children: [
															Object(Bt.jsx)('p', {
																children:
																	'We crowdsource (or is it crowdsauce?) data from Twitter, Facebook, and Instagram and from the stalls that people submit to us on this here website.',
															}),
															Object(Bt.jsxs)('p', {
																children: [
																	'To let us know about sausage and cake availability (or the absence thereof), tweet using the hashtag',
																	' ',
																	Object(Bt.jsx)('a', {
																		href: 'https://twitter.com/intent/tweet?hashtags=democracysausage',
																		children: '#democracysausage',
																	}),
																	" or send us a Direct Message. We'll be keeping an eye out.",
																],
															}),
															Object(Bt.jsx)('p', { children: "To make this work, we've also used:" }),
															Object(Bt.jsxs)('ul', {
																children: [
																	Object(Bt.jsx)('li', {
																		children:
																			'Australian Electoral Commission polling place data (likewise from the various state electoral commissions);',
																	}),
																	Object(Bt.jsxs)('li', {
																		children: [
																			'Images from ',
																			Object(Bt.jsx)('a', {
																				href: 'http://openclipart.org',
																				children: 'openclipart.org',
																			}),
																			'; specifically:',
																			' ',
																			Object(Bt.jsx)('a', {
																				href: 'http://openclipart.org/detail/7983/red-+-green-ok-not-ok-icons-by-tzeeniewheenie',
																				children: 'these tick and cross icons',
																			}),
																			', ',
																			Object(Bt.jsx)('a', {
																				href: 'http://openclipart.org/detail/6165/sausage-by-mcol',
																				children: 'this sausage icon',
																			}),
																			' and',
																			' ',
																			Object(Bt.jsx)('a', {
																				href: 'http://openclipart.org/detail/181486/cake-by-vectorsme-181486',
																				children: 'this cake icon',
																			}),
																			' (with our acknowledgements and appreciation to the artists).',
																		],
																	}),
																	Object(Bt.jsxs)('li', {
																		children: [
																			'Additional icons from ',
																			Object(Bt.jsx)('a', {
																				href: 'https://www.flaticon.com/',
																				children: 'flaticon.com',
																			}),
																			' under a',
																			' ',
																			Object(Bt.jsx)('a', {
																				href: 'http://creativecommons.org/licenses/by/3.0/',
																				title: 'Creative Commons BY 3.0',
																				target: '_blank',
																				rel: 'noopener noreferrer',
																				children: 'CC 3.0 BY',
																			}),
																			' ',
																			'license; specifically',
																			' ',
																			Object(Bt.jsx)('a', {
																				href: 'https://www.flaticon.com/free-icon/question-mark-on-a-circular-black-background_25400',
																				children: 'Question mark (by Dave Gandy)',
																			}),
																			', ',
																			Object(Bt.jsx)('a', {
																				href: 'https://www.flaticon.com/free-icon/remove_189690',
																				children: 'Run out (by Roundicons)',
																			}),
																			',',
																			' ',
																			Object(Bt.jsx)('a', {
																				href: 'https://www.flaticon.com/free-icon/vegetarian_723632',
																				children: 'Carrot on a bbq fork (by Pixel perfect)',
																			}),
																			', ',
																			Object(Bt.jsx)('a', {
																				href: 'https://www.flaticon.com/free-icon/coffee_1585293',
																				children: 'Coffee cup (by Freepik)',
																			}),
																			', and',
																			' ',
																			Object(Bt.jsx)('a', {
																				href: 'https://www.flaticon.com/free-icon/egg-and-bacon_648653',
																				children: 'Eggs and bacons (by Freepik)',
																			}),
																			'.',
																		],
																	}),
																	Object(Bt.jsxs)('li', {
																		children: [
																			'Social media icons from ',
																			Object(Bt.jsx)('a', {
																				href: 'https://fontawesome.com',
																				children: 'fontawesome.com',
																			}),
																			' under a',
																			' ',
																			Object(Bt.jsx)('a', {
																				href: 'https://fontawesome.com/license',
																				children: 'Creative Commons Attribution 4.0 license',
																			}),
																		],
																	}),
																],
															}),
															'Democracy Sausage incorporates data that is: \xa9 Commonwealth of Australia (Australian Electoral Commission)',
															' ',
															new Date().getFullYear(),
														],
													}),
													Object(Bt.jsx)(Al, { children: 'What do the all of the icons mean?' }),
													Object(Bt.jsx)(Il, {
														children: Object(Bt.jsxs)(Pt.h, {
															children: [
																Object(Bt.jsx)(Pt.i, {
																	disabled: !0,
																	primaryText: "There's a sausage sizzle here",
																	leftIcon: Object(Bt.jsx)(en, {}),
																}),
																Object(Bt.jsx)(Pt.i, {
																	disabled: !0,
																	primaryText: "There's a cake stall here",
																	leftIcon: Object(Bt.jsx)(qt, {}),
																}),
																Object(Bt.jsx)(Pt.i, {
																	disabled: !0,
																	primaryText: 'This booth has savoury vegetarian options',
																	leftIcon: Object(Bt.jsx)(yn, {}),
																}),
																Object(Bt.jsx)(Pt.i, {
																	disabled: !0,
																	primaryText: 'This booth has halal food',
																	leftIcon: Object(Bt.jsx)(Xt, {}),
																}),
																Object(Bt.jsx)(Pt.i, {
																	disabled: !0,
																	primaryText: "There's coffee available",
																	leftIcon: Object(Bt.jsx)(Kt, {}),
																}),
																Object(Bt.jsx)(Pt.i, {
																	disabled: !0,
																	primaryText: "There's bacon and egg rolls/sandwiches",
																	leftIcon: Object(Bt.jsx)(Vt, {}),
																}),
															],
														}),
													}),
													Object(Bt.jsx)(Al, { children: 'What does the halal symbol indicate?' }),
													Object(Bt.jsxs)(Il, {
														children: [
															"Firstly, it's important to note that our site can't actually provide halal certification, and we display the symbol based on information submitted to us by the folks running the stalls themselves.",
															Object(Bt.jsx)('br', {}),
															Object(Bt.jsx)('br', {}),
															"The halal symbol we use is widely understood by our users to indicate halal. (From what we understand, it is just one of a variation of halal seals / stamps that are used in Australia - though we're happy to be corrected on that). For the curious, the ABC's Bush Telegraph has more in their segment",
															' ',
															Object(Bt.jsx)('a', {
																href: 'https://www.abc.net.au/radionational/programs/archived/bushtelegraph/halal/5843904',
																children: "What's the big fuss about Halal certification?",
															}),
															'.',
														],
													}),
													Object(Bt.jsx)(Al, { children: 'Who are you?' }),
													Object(Bt.jsxs)(Il, {
														children: [
															Object(Bt.jsx)('p', {
																children: "We're six people, three babies, three cats, and some parrots.",
															}),
															Object(Bt.jsx)('p', {
																children:
																	'Well, that and a whole bunch of dedicated and hard working volunteers on election days who help out with crowdsaucing sausage sizzle locations.',
															}),
															Object(Bt.jsxs)('p', {
																children: [
																	"We're enthusiastic about democracy sausage and making elections just a little bit more fun. You can find us on Twitter at ",
																	Object(Bt.jsx)('a', {
																		href: 'http://twitter.com/DemSausage',
																		children: '@DemSausage',
																	}),
																	' or email us at',
																	' ',
																	Object(Bt.jsx)('a', {
																		href: 'mailto:ausdemocracysausage@gmail.com',
																		children: 'ausdemocracysausage@gmail.com',
																	}),
																	'.',
																],
															}),
														],
													}),
													Object(Bt.jsx)(Al, {
														children:
															'Who do we need permission from to run a sausage sizzle fundraiser at our school?',
													}),
													Object(Bt.jsxs)(Il, {
														children: [
															"Well your school, first of all (but you knew that already). Beyond that, your local government may require you to get a permit to run a temporary food stall - so give them a call to find out. There's also some pretty basic food safety regulations you'll need to abide by - check out foodstandards.gov.au",
															' ',
															Object(Bt.jsx)('a', {
																href: 'http://www.foodstandards.gov.au/consumer/safety/faqsafety/pages/foodsafetyfactsheets/charitiesandcommunityorganisationsfactsheets/sausagesizzlesandbar1478.aspx',
																children: 'for more information',
															}),
															'.',
														],
													}),
													Object(Bt.jsx)(Al, { children: 'Are you part of any political parties?' }),
													Object(Bt.jsx)(Il, {
														children:
															'Nope! Democracy Sausage is 100% non-partisan, organic, hormone free, and grass fed.',
													}),
													Object(Bt.jsx)(Al, { children: 'Will you share my info with others?' }),
													Object(Bt.jsxs)(Il, {
														children: [
															Object(Bt.jsx)('p', {
																children:
																	"If you submit a stall to us, we won't share any personal information about you - such as your email address, Twitter handle, et cetera.",
															}),
															Object(Bt.jsx)('p', {
																children:
																	'We do occasionally work with other websites to share data about sausage sizzles, but we only ever send them information about the stalls and locations and polling booths.',
															}),
														],
													}),
												],
											}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				Fl = Object(c.c)(
					function (e) {
						return {};
					},
					function (e) {
						return {};
					},
				)(Ll),
				Nl = wt.a.div(Pl || (Pl = Object(Ct.a)(['\n  padding-left: 15px;\n  padding-right: 15px;\n']))),
				Dl = (function (e) {
					Object(xt.a)(n, e);
					var t = Object(gt.a)(n);
					function n() {
						return Object(je.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(fe.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Bt.jsxs)(yt.Fragment, {
										children: [
											Object(Bt.jsxs)(zt.a, {
												children: [
													Object(Bt.jsx)('title', { children: 'Democracy Sausage | Media' }),
													Object(Bt.jsx)('meta', {
														property: 'og:url',
														content: ''.concat('https://public-legacy.staging.democracysausage.org', '/media'),
													}),
													Object(Bt.jsx)('meta', { property: 'og:title', content: 'Democracy Sausage | Media' }),
												],
											}),
											Object(Bt.jsxs)(Nl, {
												children: [
													Object(Bt.jsx)('h2', { children: 'Media' }),
													'Do you love sausage? We do!',
													Object(Bt.jsxs)(Kn.List, {
														children: [
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Media Contact',
																secondaryText: 'ausdemocracysausage@gmail.com',
																secondaryTextLines: 2,
																leftIcon: Object(Bt.jsx)(Rt.CommunicationEmail, {}),
																disabled: !0,
															}),
															Object(Bt.jsx)('h3', { children: 'Media Releases' }),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Federal Election 2022 - April 10th',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/2022%20Federal%20Election%20Media%20Release%20-%2010%20Apr.pdf',
																}),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'WA Election 2021 - March 13th',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/2021%20WA%20Media%20Release%20-%206%20Mar.pdf',
																}),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'ACT & QLD Elections 2020 - October 11th',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/2020%20ACT%20%2B%20Qld%20-%20Media%20Release%20-%2011%20Oct.pdf',
																}),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'NT Election 2020 - August 22nd',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/2020%20NT%20-%20Media%20Release.pdf',
																}),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Federal Election 2019 - May 17th',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/2019%20Federal%20Election%20Media%20Release%20-%2017%20May.pdf',
																}),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Federal Election 2019 - April 13th',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/2019%20Fed%20-%20Media%20Release.pdf',
																}),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Federal Election 2016',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/Democracy%20Sausage%20-%202016%20Federal%20Election%20Release.pdf',
																}),
															}),
															Object(Bt.jsx)(Kn.ListItem, {
																primaryText: 'Canning By-election',
																leftIcon: Object(Bt.jsx)(Rt.FileFileDownload, {}),
																containerElement: Object(Bt.jsx)('a', {
																	href: '/media/Canning%20Press%20Release%20-%20DemSausage.pdf',
																}),
															}),
														],
													}),
												],
											}),
										],
									});
								},
							},
						]),
						n
					);
				})(yt.Component),
				Ul = Object(c.c)(
					function (e) {
						return {};
					},
					function (e) {
						return {};
					},
				)(Dl),
				Gl = function (e) {
					return Object(Bt.jsxs)(s.b, {
						component: kc,
						children: [
							Object(Bt.jsx)(s.b, { path: '/elections', components: { content: js } }),
							Object(Bt.jsx)(s.b, { path: '/search(/:electionName)', components: { content: Ms } }),
							Object(Bt.jsx)(s.b, { path: '/sausagelytics(/:electionName)', components: { content: ml } }),
							Object(Bt.jsx)(s.b, { path: '/sausagelytics_v1(/:electionName)', components: { content: Ml } }),
							Object(Bt.jsx)(s.b, { path: '/add-stall', components: { content: ho } }),
							Object(Bt.jsx)(s.b, { path: '/edit-stall', components: { content: Qc } }),
							Object(Bt.jsx)(s.b, { path: '/embed-builder', components: { content: ws } }),
							Object(Bt.jsx)(s.b, { path: '/about', components: { content: Fl } }),
							Object(Bt.jsx)(s.b, { path: '/media', components: { content: Ul } }),
							Object(Bt.jsx)(s.b, { path: '/(:electionName)/stalls/(:stallId)', components: { content: mi } }),
							Object(Bt.jsx)(s.b, { path: '/(:electionName)/polling_places/(:ecId)', components: { content: mi } }),
							Object(Bt.jsx)(s.b, {
								path: '/(:electionName)/polling_places/(:name)/(:premises)/(:state)',
								components: { content: mi },
							}),
							Object(Bt.jsx)(s.b, { path: '/(:electionName)', components: { content: ci } }),
						],
					});
				},
				Bl = n(343),
				Wl = n(840),
				Vl = (function () {
					function e() {
						Object(je.a)(this, e),
							(this.baseURL = void 0),
							(this.baseURL = 'https://public-legacy.staging.democracysausage.org/api');
					}
					return (
						Object(fe.a)(e, [
							{
								key: 'handleResponse',
								value: function (e, t, n) {
									var a = this;
									return 404 === t.status
										? { response: t, undefined: void 0 }
										: t.status >= 401
											? t
													.json()
													.then(function (o) {
														return a.handleError(o, e, n), { response: t, json: o };
													})
													.catch(function (e) {
														return { response: t, json: null };
													})
											: t.json().then(function (e) {
													return (
														400 === t.status &&
															n(Be("Sorry about this, but there's been an error handling your request.")),
														{ response: t, json: e }
													);
												});
								},
							},
							{
								key: 'handleError',
								value: function (e, t, n) {
									!0 === se() ? console.error(e) : (b.b(''.concat(e, ' For ').concat(t)), b.b(e), a.b());
								},
							},
							{
								key: 'get',
								value: (function () {
									var e = Object(g.a)(
										x.a.mark(function e(t, n) {
											var a,
												o,
												c,
												s = this,
												r = arguments;
											return x.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	(a = r.length > 2 && void 0 !== r[2] ? r[2] : {}),
																	(o = r.length > 3 && void 0 !== r[3] ? r[3] : {}),
																	n(ae()),
																	Object.keys(a).length > 0 && (t += '?'.concat(Wl.stringify(a))),
																	(e.next = 6),
																	fetch(this.baseURL + t, Object(v.a)(Object(v.a)({}, { credentials: 'include' }), o))
																		.then(function (e) {
																			return n(oe()), s.handleResponse(t, e, n);
																		})
																		.catch(function (e) {
																			return s.handleError(e, t, n);
																		})
																);
															case 6:
																if (void 0 === (c = e.sent)) {
																	e.next = 9;
																	break;
																}
																return e.abrupt('return', c);
															case 9:
																return e.abrupt(
																	'return',
																	new Promise(function (e) {
																		return e({
																			response: new Response(null, {
																				status: 499,
																				statusText: 'Client Closed Request',
																			}),
																			json: null,
																		});
																	}),
																);
															case 10:
															case 'end':
																return e.stop();
														}
												},
												e,
												this,
											);
										}),
									);
									return function (t, n) {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'post',
								value: function (e) {
									var t = this,
										n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
										a = arguments.length > 2 ? arguments[2] : void 0;
									return (
										a(ae()),
										fetch(this.baseURL + e, {
											method: 'POST',
											mode: 'cors',
											credentials: 'include',
											headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Bl.get('csrftoken') },
											body: JSON.stringify(n),
										})
											.then(function (n) {
												return a(oe()), t.handleResponse(e, n, a);
											})
											.catch(function (n) {
												return t.handleError(n, e, a);
											})
									);
								},
							},
							{
								key: 'put',
								value: function (e, t) {
									var n = this,
										a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
										o = arguments.length > 3 ? arguments[3] : void 0;
									return (
										o(ae()),
										fetch(this.baseURL + e, {
											method: 'PUT',
											mode: 'cors',
											credentials: 'include',
											headers: Object(v.a)({ 'X-CSRFToken': Bl.get('csrftoken') }, a),
											body: t,
										})
											.then(function (t) {
												return o(oe()), n.handleResponse(e, t, o);
											})
											.catch(function (t) {
												return n.handleError(t, e, o);
											})
									);
								},
							},
							{
								key: 'patch',
								value: function (e) {
									var t = this,
										n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
										a = arguments.length > 2 ? arguments[2] : void 0;
									return (
										a(ae()),
										fetch(this.baseURL + e, {
											method: 'PATCH',
											mode: 'cors',
											credentials: 'include',
											headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Bl.get('csrftoken') },
											body: JSON.stringify(n),
										})
											.then(function (n) {
												return a(oe()), t.handleResponse(e, n, a);
											})
											.catch(function (n) {
												return t.handleError(n, e, a);
											})
									);
								},
							},
							{
								key: 'delete',
								value: function (e, t) {
									var n = this;
									return (
										t(ae()),
										fetch(this.baseURL + e, {
											method: 'DELETE',
											mode: 'cors',
											credentials: 'include',
											headers: { 'Content-Type': 'application/json', 'X-CSRFToken': Bl.get('csrftoken') },
										})
											.then(function (e) {
												return t(oe()), e;
											})
											.catch(function (a) {
												return n.handleError(a, e, t);
											})
									);
								},
							},
						]),
						e
					);
				})(),
				Hl = [];
			'REACT_APP_RAVEN_URL' in
				Object({
					NODE_ENV: 'production',
					PUBLIC_URL: '',
					WDS_SOCKET_HOST: void 0,
					WDS_SOCKET_PATH: void 0,
					WDS_SOCKET_PORT: void 0,
					FAST_REFRESH: !0,
					REACT_APP_RAVEN_URL: 'https://8d31580cc3314ca0812ff9d72c4d996f@sentry.io/291819',
					REACT_APP_MAPBOX_API_KEY_PROD:
						'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNrZm0xM3Q1MndwYnhnZHBuc2E2In0.Q05Vy754rVLXWJJCD7qX8g',
					REACT_APP_GOOGLE_ANALYTICS_UA: 'UA-48888573-1',
					REACT_APP_ENVIRONMENT: 'PRODUCTION',
					REACT_APP_RAVEN_SITE_NAME: 'DemSausage Public',
					REACT_APP_API_BASE_URL: 'https://public-legacy.staging.democracysausage.org/api',
					REACT_APP_GOOGLE_MAPS_API_KEY: 'AIzaSyBuOuavKmg0pKmdGEPdugThfnKQ7v1sSH0',
					REACT_APP_MAPBOX_API_KEY_DEV:
						'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNldnExZmQxMnpwbWJiODI5Y2R0In0.PtxxMO-qppmcivwcegWKYA',
					REACT_APP_SITE_BASE_URL: 'https://public-legacy.staging.democracysausage.org',
				}) &&
				(a.a({
					dsn: 'https://8d31580cc3314ca0812ff9d72c4d996f@sentry.io/291819',
					environment: ''.concat('PRODUCTION', '-PUBLIC').toUpperCase(),
					site: 'DemSausage Public',
					attachStacktrace: !0,
				}),
				Hl.push(ht)),
				'REACT_APP_GOOGLE_ANALYTICS_UA' in
					Object({
						NODE_ENV: 'production',
						PUBLIC_URL: '',
						WDS_SOCKET_HOST: void 0,
						WDS_SOCKET_PATH: void 0,
						WDS_SOCKET_PORT: void 0,
						FAST_REFRESH: !0,
						REACT_APP_RAVEN_URL: 'https://8d31580cc3314ca0812ff9d72c4d996f@sentry.io/291819',
						REACT_APP_MAPBOX_API_KEY_PROD:
							'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNrZm0xM3Q1MndwYnhnZHBuc2E2In0.Q05Vy754rVLXWJJCD7qX8g',
						REACT_APP_GOOGLE_ANALYTICS_UA: 'UA-48888573-1',
						REACT_APP_ENVIRONMENT: 'PRODUCTION',
						REACT_APP_RAVEN_SITE_NAME: 'DemSausage Public',
						REACT_APP_API_BASE_URL: 'https://public-legacy.staging.democracysausage.org/api',
						REACT_APP_GOOGLE_MAPS_API_KEY: 'AIzaSyBuOuavKmg0pKmdGEPdugThfnKQ7v1sSH0',
						REACT_APP_MAPBOX_API_KEY_DEV:
							'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNldnExZmQxMnpwbWJiODI5Y2R0In0.PtxxMO-qppmcivwcegWKYA',
						REACT_APP_SITE_BASE_URL: 'https://public-legacy.staging.democracysausage.org',
					}) &&
					Hl.push(function (e) {
						return function (e) {
							return function (t) {
								return (
									'meta' in t &&
										'analytics' in t.meta &&
										ca.event(Object(v.a)(Object(v.a)({}, t.meta.analytics), {}, { type: t.type })),
									e(t)
								);
							};
						};
					});
			var ql = Object(l.composeWithDevTools)({}),
				Yl = Object(i.createStore)(
					jt,
					ql(
						d.b,
						i.applyMiddleware.apply(
							void 0,
							[
								p.a.withExtraArgument(new Vl()),
								re.middleware,
								function (e) {
									return function (e) {
										return function (t) {
											return (
												Object(j.m)(t) &&
													((400 !== t.payload.originalStatus && 404 !== t.payload.originalStatus) ||
														console.error('@TODO Implement 400 and 404 handling'),
													!0 === se()
														? console.error(
																''
																	.concat(t.error.message, ' [')
																	.concat(t.payload.originalStatus, ': ')
																	.concat(t.payload.status, '] for ')
																	.concat(t.type),
																t,
															)
														: (b.b(
																''
																	.concat(t.error.message, ' [')
																	.concat(t.payload.originalStatus, ': ')
																	.concat(t.payload.status, '] for ')
																	.concat(t.type),
															),
															b.b(t),
															a.b())),
												e(t)
											);
										};
									};
								},
							].concat(Hl),
						),
					),
				),
				Kl = Object(r.syncHistoryWithStore)(s.d, Yl);
			o.render(
				Object(Bt.jsx)(c.a, {
					store: Yl,
					children: Object(Bt.jsx)(s.c, {
						history: Kl,
						onUpdate:
							'REACT_APP_GOOGLE_ANALYTICS_UA' in
							Object({
								NODE_ENV: 'production',
								PUBLIC_URL: '',
								WDS_SOCKET_HOST: void 0,
								WDS_SOCKET_PATH: void 0,
								WDS_SOCKET_PORT: void 0,
								FAST_REFRESH: !0,
								REACT_APP_RAVEN_URL: 'https://8d31580cc3314ca0812ff9d72c4d996f@sentry.io/291819',
								REACT_APP_MAPBOX_API_KEY_PROD:
									'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNrZm0xM3Q1MndwYnhnZHBuc2E2In0.Q05Vy754rVLXWJJCD7qX8g',
								REACT_APP_GOOGLE_ANALYTICS_UA: 'UA-48888573-1',
								REACT_APP_ENVIRONMENT: 'PRODUCTION',
								REACT_APP_RAVEN_SITE_NAME: 'DemSausage Public',
								REACT_APP_API_BASE_URL: 'https://public-legacy.staging.democracysausage.org/api',
								REACT_APP_GOOGLE_MAPS_API_KEY: 'AIzaSyBuOuavKmg0pKmdGEPdugThfnKQ7v1sSH0',
								REACT_APP_MAPBOX_API_KEY_DEV:
									'pk.eyJ1IjoiYXVzZGVtb2NyYWN5c2F1c2FnZSIsImEiOiJjamVwYXNldnExZmQxMnpwbWJiODI5Y2R0In0.PtxxMO-qppmcivwcegWKYA',
								REACT_APP_SITE_BASE_URL: 'https://public-legacy.staging.democracysausage.org',
							})
								? function () {
										ca.pageview(window.location.pathname + window.location.search);
									}
								: void 0,
						children: Gl(Yl),
					}),
				}),
				document.getElementById('root'),
			),
				bt();
		},
		575: function (e) {
			e.exports = JSON.parse(
				'{"a":[{"filename":"cake_tick.png","frame":{"x":-1,"y":-1,"w":80,"h":73},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-1,"y":-1,"w":80,"h":73},"sourceSize":{"w":80,"h":73}},{"filename":"cake_run_out.png","frame":{"x":-83,"y":-1,"w":80,"h":73},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-83,"y":-1,"w":80,"h":73},"sourceSize":{"w":80,"h":73}},{"filename":"cake_plus.png","frame":{"x":-1,"y":-76,"w":80,"h":73},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-1,"y":-76,"w":80,"h":73},"sourceSize":{"w":80,"h":73}},{"filename":"bbq_and_cake_tick.png","frame":{"x":-83,"y":-76,"w":80,"h":69},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-83,"y":-76,"w":80,"h":69},"sourceSize":{"w":80,"h":69}},{"filename":"bbq_and_cake_run_out.png","frame":{"x":-165,"y":-1,"w":80,"h":69},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-165,"y":-1,"w":80,"h":69},"sourceSize":{"w":80,"h":69}},{"filename":"bbq_and_cake_plus.png","frame":{"x":-165,"y":-72,"w":80,"h":69},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-165,"y":-72,"w":80,"h":69},"sourceSize":{"w":80,"h":69}},{"filename":"bbq_and_cake.png","frame":{"x":-1,"y":-151,"w":80,"h":69},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-1,"y":-151,"w":80,"h":69},"sourceSize":{"w":80,"h":69}},{"filename":"vego.png","frame":{"x":-83,"y":-151,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-83,"y":-151,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"tick.png","frame":{"x":-149,"y":-151,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-149,"y":-151,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"run_out.png","frame":{"x":-247,"y":-1,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-247,"y":-1,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"red_cross_of_shame.png","frame":{"x":-247,"y":-67,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-247,"y":-67,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"plus.png","frame":{"x":-247,"y":-133,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-247,"y":-133,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"halal.png","frame":{"x":-1,"y":-222,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-1,"y":-222,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"coffee.png","frame":{"x":-67,"y":-222,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-67,"y":-222,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"cake.png","frame":{"x":-133,"y":-222,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-133,"y":-222,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"bbq_tick.png","frame":{"x":-199,"y":-222,"w":64,"h":59},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-199,"y":-222,"w":64,"h":59},"sourceSize":{"w":64,"h":59}},{"filename":"bbq_run_out.png","frame":{"x":-313,"y":-1,"w":64,"h":59},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-313,"y":-1,"w":64,"h":59},"sourceSize":{"w":64,"h":59}},{"filename":"bbq_plus.png","frame":{"x":-313,"y":-62,"w":64,"h":59},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-313,"y":-62,"w":64,"h":59},"sourceSize":{"w":64,"h":59}},{"filename":"bbq.png","frame":{"x":-313,"y":-123,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-313,"y":-123,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"bacon_and_eggs.png","frame":{"x":-313,"y":-189,"w":64,"h":64},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-313,"y":-189,"w":64,"h":64},"sourceSize":{"w":64,"h":64}},{"filename":"unknown.png","frame":{"x":-313,"y":-255,"w":14,"h":14},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":-313,"y":-255,"w":14,"h":14},"sourceSize":{"w":14,"h":14}}],"b":{"version":"0.13","hash":"06bb44d09c","name":"sprite","sprite_path":"sprite_06bb44d09c.png","sprite_filename":"sprite_06bb44d09c.png","width":378,"height":287}}',
			);
		},
		892: function (e, t, n) {},
	},
	[[2360, 1, 2]],
]);
//# sourceMappingURL=main.5e75fdf2.chunk.js.map
