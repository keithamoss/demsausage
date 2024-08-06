(this.webpackJsonpadmin = this.webpackJsonpadmin || []).push([
	[0],
	{
		1829: function (e, t, n) {},
		1947: function (e, t) {},
		1949: function (e, t, n) {
			'use strict';
			n.r(t);
			var c = n(1954),
				o = n(60),
				s = n(38),
				a = n(34),
				l = n(321),
				i = n(72),
				r = n(581),
				p = n(346),
				j = n(598),
				d = (n(660), n(661), n(681), n(682), n(683), n(684), n(685), n(686), n(178)),
				u = n(575),
				f = n(16),
				b = n.n(f),
				h = n(33),
				O = n(47),
				m = n(5),
				x = n(43),
				g = n(1957),
				z = n(242),
				v = n(285),
				y = 'ealgis/snackbars/ADD_MESSAGE',
				C = 'ealgis/snackbars/START',
				M = 'ealgis/snackbars/NEXT',
				_ = { open: !1, active: { message: '' }, messages: [] };
			function w() {
				return function (e) {
					return e({ type: M });
				};
			}
			function k(e) {
				return function (t) {
					return (
						t(
							(function (e) {
								return { type: y, message: e };
							})(e),
						),
						t({ type: C })
					);
				};
			}
			function P(e) {
				return function (t) {
					return t(k({ message: e, autoHideDuration: 2500 }));
				};
			}
			var T = 'ealgis/elections/LOAD_ELECTIONS',
				S = 'ealgis/elections/LOAD_ELECTION',
				I = 'ealgis/elections/SET_CURRENT_ELECTION',
				E = 'ealgis/elections/SET_PRIMARY_ELECTION',
				R = { elections: [] };
			var A = function (e) {
					return e.elections.elections;
				},
				L = Object(v.a)([A], function (e) {
					return Object(g.a)(e, ['election_day'], ['desc']);
				});
			Object(v.a)([A], function (e) {
				return e.filter(function (e) {
					return W(e);
				});
			});
			function D(e) {
				return { type: S, election: e };
			}
			function U(e) {
				return { type: I, electionId: e };
			}
			function N(e) {
				return { type: E, electionId: e };
			}
			function F(e) {
				return (function () {
					var t = Object(h.a)(
						b.a.mark(function t(n, c, o) {
							var s, a, l;
							return b.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.post('/0.1/elections/', e, n);
										case 2:
											if (((s = t.sent), (a = s.response), (l = s.json), 201 !== a.status)) {
												t.next = 9;
												break;
											}
											return n(D(l)), n(P('Election created! \ud83c\udf2d\ud83c\udf89')), t.abrupt('return', l);
										case 9:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, c) {
						return t.apply(this, arguments);
					};
				})();
			}
			function G(e, t) {
				return (function () {
					var n = Object(h.a)(
						b.a.mark(function n(c, o, s) {
							var a, l, i;
							return b.a.wrap(function (n) {
								for (;;)
									switch ((n.prev = n.next)) {
										case 0:
											return (n.next = 2), s.patch('/0.1/elections/'.concat(e.id, '/'), t, c);
										case 2:
											if (((a = n.sent), (l = a.response), (i = a.json), 200 !== l.status)) {
												n.next = 9;
												break;
											}
											return c(D(i)), c(P('Election updated! \ud83c\udf2d\ud83c\udf89')), n.abrupt('return', i);
										case 9:
										case 'end':
											return n.stop();
									}
							}, n);
						}),
					);
					return function (e, t, c) {
						return n.apply(this, arguments);
					};
				})();
			}
			var W = function (e) {
					return z.DateTime.local().endOf('day') <= z.DateTime.fromISO(e.election_day).endOf('day');
				},
				B = n(64),
				V = 'ealgis/polling_places/LOAD',
				H = 'ealgis/polling_places/LOAD_TYPES',
				q = { types: [], by_election: {} };
			var J, K;
			function X(e, t) {
				return (function () {
					var n = Object(h.a)(
						b.a.mark(function n(c, o, s) {
							var a, l, i;
							return b.a.wrap(function (n) {
								for (;;)
									switch ((n.prev = n.next)) {
										case 0:
											return (
												(n.next = 2), s.get('/0.1/polling_places/search/', c, { election_id: e.id, search_term: t })
											);
										case 2:
											if (((a = n.sent), (l = a.response), (i = a.json), 200 !== l.status)) {
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
					return function (e, t, c) {
						return n.apply(this, arguments);
					};
				})();
			}
			function Y(e, t) {
				return (function () {
					var n = Object(h.a)(
						b.a.mark(function n(c, o, s) {
							var a, l, i;
							return b.a.wrap(function (n) {
								for (;;)
									switch ((n.prev = n.next)) {
										case 0:
											return (
												(n.next = 2), s.get('/0.1/polling_places/search/', c, { election_id: e.id, ids: t.join(',') })
											);
										case 2:
											if (((a = n.sent), (l = a.response), (i = a.json), 200 !== l.status)) {
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
					return function (e, t, c) {
						return n.apply(this, arguments);
					};
				})();
			}
			function Q(e) {
				return (function () {
					var t = Object(h.a)(
						b.a.mark(function t(n, c, o) {
							var s, a, l;
							return b.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (
												(t.next = 2), o.get('/0.1/polling_places/without_facility_type/', n, { election_id: e.id })
											);
										case 2:
											if (((s = t.sent), (a = s.response), (l = s.json), 200 !== a.status)) {
												t.next = 7;
												break;
											}
											return t.abrupt('return', l);
										case 7:
											return t.abrupt('return', null);
										case 8:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, c) {
						return t.apply(this, arguments);
					};
				})();
			}
			function Z(e) {
				return (function () {
					var t = Object(h.a)(
						b.a.mark(function t(n, c, o) {
							var s, a, l;
							return b.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.get('/0.1/polling_places/favourited/', n, { election_id: e.id });
										case 2:
											if (((s = t.sent), (a = s.response), (l = s.json), 200 !== a.status)) {
												t.next = 7;
												break;
											}
											return t.abrupt('return', l);
										case 7:
											return t.abrupt('return', null);
										case 8:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, c) {
						return t.apply(this, arguments);
					};
				})();
			}
			function $(e, t, n) {
				return (function () {
					var e = Object(h.a)(
						b.a.mark(function e(c, o, s) {
							var a, l, i;
							return b.a.wrap(function (e) {
								for (;;)
									switch ((e.prev = e.next)) {
										case 0:
											return (e.next = 2), s.patch('/0.1/polling_places/'.concat(t.id, '/'), n, c);
										case 2:
											if (((a = e.sent), (l = a.response), (i = a.json), 200 !== l.status)) {
												e.next = 8;
												break;
											}
											return c(P('Polling place updated! \ud83c\udf2d\ud83c\udf89')), e.abrupt('return', i);
										case 8:
										case 'end':
											return e.stop();
									}
							}, e);
						}),
					);
					return function (t, n, c) {
						return e.apply(this, arguments);
					};
				})();
			}
			function ee(e, t, n, c) {
				return (function () {
					var o = Object(h.a)(
						b.a.mark(function o(s, a, l) {
							var i, r, p;
							return b.a.wrap(function (o) {
								for (;;)
									switch ((o.prev = o.next)) {
										case 0:
											return (
												(i = new FormData()).append('file', t),
												i.append('dry_run', !0 === c ? '1' : '0'),
												void 0 !== n && i.append('config', n),
												(o.next = 6),
												l.put(
													'/0.1/elections/'.concat(e.id, '/polling_places/'),
													i,
													{ 'Content-Disposition': 'attachment; filename=polling_places.csv' },
													s,
												)
											);
										case 6:
											return (r = o.sent), (p = r.json), o.abrupt('return', p);
										case 9:
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
			function te(e, t) {
				return (function () {
					var n = Object(h.a)(
						b.a.mark(function n(c, o, s) {
							var a, l, i;
							return b.a.wrap(function (n) {
								for (;;)
									switch ((n.prev = n.next)) {
										case 0:
											return (
												(n.next = 2),
												s.get('/0.1/elections/'.concat(e.id, '/polling_place_loader_job/'), c, { job_id: t })
											);
										case 2:
											if (((a = n.sent), (l = a.response), (i = a.json), 200 !== l.status)) {
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
					return function (e, t, c) {
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
			})(J || (J = {})),
				(function (e) {
					(e.ERROR = 'ERROR'), (e.CHECK = 'CHECK'), (e.INFO = 'INFO'), (e.WARNING = 'WARNING');
				})(K || (K = {}));
			var ne = function (e, t) {
				return encodeURI(
					''
						.concat('https://democracysausage.org', '/')
						.concat(
							(function (e) {
								return encodeURI(e.name.replace(/\s/g, '_').toLowerCase());
							})(e),
							'/polling_places/',
						)
						.concat(t.name, '/')
						.concat(t.premises, '/')
						.concat(t.state, '/')
						.replace(/\s/g, '_'),
				);
			};
			function ce(e) {
				if (null === e) return {};
				var t = {};
				return (
					['bbq', 'cake', 'nothing', 'run_out', 'coffee', 'vego', 'halal', 'bacon_and_eggs', 'free_text'].forEach(
						function (n) {
							var c = e[n];
							'free_text' !== n ? !0 === c && (t[n] = c) : '' !== c && (t[n] = c);
						},
					),
					t
				);
			}
			var oe = function (e) {
				return e.name === e.premises ? e.name : ''.concat(e.name, ', ').concat(e.premises);
			};
			function se(e) {
				return '' === e.wheelchair_access || null === e.wheelchair_access ? 'None' : e.wheelchair_access;
			}
			var ae = n(582),
				le = 'ealgis/stalls/LOAD_PENDING',
				ie = 'ealgis/stalls/REMOVE',
				re = { pending: [] };
			var pe;
			Object(v.a)(
				[
					function (e) {
						return e.stalls.pending;
					},
				],
				function (e) {
					return Object(ae.a)(function (t) {
						return e.filter(function (e) {
							return e.election_id === t;
						});
					});
				},
			);
			function je(e) {
				return { type: le, stalls: e };
			}
			function de(e) {
				return { type: ie, stallId: e };
			}
			function ue() {
				var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
				return (function () {
					var t = Object(h.a)(
						b.a.mark(function t(n, c, o) {
							var s, a, l;
							return b.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.get('/0.1/stalls/pending/', n, {}, e);
										case 2:
											if (((s = t.sent), (a = s.response), (l = s.json), 200 !== a.status)) {
												t.next = 8;
												break;
											}
											return n(je(l)), t.abrupt('return', l.rows);
										case 8:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, c) {
						return t.apply(this, arguments);
					};
				})();
			}
			function fe(e) {
				return (function () {
					var t = Object(h.a)(
						b.a.mark(function t(n, c, o) {
							var s, a, l;
							return b.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.patch('/0.1/stalls/'.concat(e, '/approve/'), {}, n);
										case 2:
											if (((s = t.sent), (a = s.response), (l = s.json), 200 !== a.status)) {
												t.next = 9;
												break;
											}
											return n(P('Pending stall updated! \ud83c\udf7d\ud83c\udf89')), n(de(e)), t.abrupt('return', l);
										case 9:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, c) {
						return t.apply(this, arguments);
					};
				})();
			}
			function be(e) {
				return (function () {
					var t = Object(h.a)(
						b.a.mark(function t(n, c, o) {
							var s, a, l;
							return b.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.patch('/0.1/stalls/'.concat(e, '/approve_and_add/'), {}, n);
										case 2:
											if (((s = t.sent), (a = s.response), (l = s.json), 200 !== a.status)) {
												t.next = 9;
												break;
											}
											return (
												n(P('Pending stall updated and new polling place added! \ud83c\udf7d\ud83c\udf89')),
												n(de(e)),
												t.abrupt('return', l)
											);
										case 9:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, c) {
						return t.apply(this, arguments);
					};
				})();
			}
			function he(e) {
				return (function () {
					var t = Object(h.a)(
						b.a.mark(function t(n, c, o) {
							var s, a, l;
							return b.a.wrap(function (t) {
								for (;;)
									switch ((t.prev = t.next)) {
										case 0:
											return (t.next = 2), o.patch('/0.1/stalls/'.concat(e, '/'), { status: pe.DECLINED }, n);
										case 2:
											if (((s = t.sent), (a = s.response), (l = s.json), 200 !== a.status)) {
												t.next = 9;
												break;
											}
											return n(P('Pending stall declined! \ud83c\udf7d\ud83c\udf89')), n(de(e)), t.abrupt('return', l);
										case 9:
										case 'end':
											return t.stop();
									}
							}, t);
						}),
					);
					return function (e, n, c) {
						return t.apply(this, arguments);
					};
				})();
			}
			!(function (e) {
				(e.PENDING = 'Pending'), (e.APPROVED = 'Approved'), (e.DECLINED = 'Declined');
			})(pe || (pe = {}));
			var Oe = function (e) {
					return null !== e.polling_place
						? e.polling_place.premises
						: null !== e.location_info
							? e.location_info.name
							: "Error: Couldn't get stall location name";
				},
				me = function (e) {
					return null !== e.polling_place
						? e.polling_place.address
						: null !== e.location_info
							? e.location_info.address
							: "Error: Couldn't get stall location address";
				},
				xe = 'ealgis/user/LOAD_USER',
				ge = { user: {} };
			var ze,
				ve = 'ealgis/app/LOADING',
				ye = 'ealgis/app/LOADED',
				Ce = 'ealgis/app/BEGIN_FETCH',
				Me = 'ealgis/app/FINISH_FETCH',
				_e = 'ealgis/app/SET_LAST_PAGE',
				we = 'ealgis/app/TOGGLE_MODAL';
			!(function (e) {
				(e[(e.DEV = 1)] = 'DEV'), (e[(e.TEST = 2)] = 'TEST'), (e[(e.PROD = 3)] = 'PROD');
			})(ze || (ze = {}));
			var ke = { loading: !0, requestsInProgress: 0, previousPath: '', modals: new Map() };
			function Pe() {
				return { type: Ce };
			}
			function Te() {
				return { type: Me };
			}
			function Se() {
				return ze.PROD !== ze.PROD;
			}
			var Ie,
				Ee,
				Re,
				Ae,
				Le = u.a,
				De = i.combineReducers({
					app: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ke,
							t = arguments.length > 1 ? arguments[1] : void 0,
							n = O.get(e, 'requestsInProgress');
						switch (t.type) {
							case ve:
								return O.set(e, 'loading', !0);
							case ye:
								return O.set(e, 'loading', !1);
							case Ce:
								return O.set(e, 'requestsInProgress', (n += 1));
							case Me:
								return O.set(e, 'requestsInProgress', (n -= 1));
							case _e:
								return O.set(e, 'previousPath', t.previousPath);
							case we:
								var c = O.get(e, 'modals');
								return c.set(t.modalId, !c.get(t.modalId)), O.set(e, 'modals', c);
							default:
								return e;
						}
					},
					user: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ge,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case xe:
								return O.set(e, 'user', t.user);
							default:
								return e;
						}
					},
					snackbars: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : _,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case y:
								return e.messages.push(t.message), O.set(e, 'messages', e.messages);
							case C:
								if (!1 === e.open && e.messages.length > 0) {
									var n = e.messages.shift();
									(e = O.set(e, 'messages', e.messages)), (e = O.set(e, 'active', n)), (e = O.set(e, 'open', !0));
								}
								return e;
							case M:
								if (e.messages.length > 0) {
									var c = e.messages.shift();
									return (e = O.set(e, 'messages', e.messages)), (e = O.set(e, 'active', c)), O.set(e, 'open', !0);
								}
								return (e = O.set(e, 'active', { message: '' })), O.set(e, 'open', !1);
							default:
								return e;
						}
					},
					elections: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : R,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case T:
								return O.set(e, 'elections', t.elections);
							case S:
								var n = e.elections.findIndex(function (e) {
									return e.id === t.election.id;
								});
								return -1 === n
									? O.set(e, 'elections', [t.election].concat(Object(x.a)(e.elections)))
									: O.set(
											e,
											'elections.'.concat(n),
											Object(m.a)(Object(m.a)({}, O.get(e, 'elections.'.concat(n))), t.election),
										);
							case I:
								return O.set(e, 'current_election_id', t.electionId);
							case E:
								return (
									e.elections.forEach(function (n, c) {
										e = O.set(e, 'elections.'.concat(c, '.is_primary'), n.id === t.electionId);
									}),
									e
								);
							default:
								return e;
						}
					},
					polling_places: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : q,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case V:
								return O.set(e, 'by_election.'.concat(t.election.id), t.pollingPlaces);
							case H:
								return O.set(e, 'types', t.pollingPlaceTypes);
							default:
								return e;
						}
					},
					stalls: function () {
						var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : re,
							t = arguments.length > 1 ? arguments[1] : void 0;
						switch (t.type) {
							case le:
								return O.set(e, 'pending', t.stalls);
							case ie:
								var n = e.pending.filter(function (e) {
									return e.id !== t.stallId;
								});
								return O.set(e, 'pending', n);
							default:
								return e;
						}
					},
					routing: l.routerReducer,
					form: Le.plugin({
						pollingPlace: function (e, t) {
							switch (t.type) {
								case 'ealgis/polling_places/VALIDATION_ERRORS':
									return (e = O.set(e, 'submitSucceeded', !1)), O.merge(e, 'syncErrors', t.errors);
								default:
									return e;
							}
						},
					}),
					browser: p.a,
					responsiveDrawer: d.d,
				}),
				Ue = n(128),
				Ne = n(101),
				Fe = function (e) {
					return (
						Ue.b(function (t) {
							var n = JSON.parse(JSON.stringify(e.getState()));
							return (
								'map' in n && 'geojson' in n.map && (n.map.geojson = Object.keys(n.map.geojson)),
								Object(m.a)(
									Object(m.a)({}, t),
									{},
									{ extra: Object(m.a)(Object(m.a)({}, t.extra), {}, { 'redux:state': n }) },
								)
							);
						}),
						function (e) {
							return function (t) {
								return Ne.a({ category: 'redux-action', message: t.type }), e(t);
							};
						}
					);
				},
				Ge = n(8),
				We = n(10),
				Be = n(20),
				Ve = n(21),
				He = n(166),
				qe = n.n(He),
				Je = n(39),
				Ke = n(440),
				Xe = n.n(Ke),
				Ye = n(228),
				Qe = n.n(Ye),
				Ze = n(127),
				$e = n(0),
				et = n(351),
				tt = n(40),
				nt = n(272),
				ct = n.n(nt),
				ot = n(198),
				st = n(195),
				at = n.n(st),
				lt = n(116),
				it = n.n(lt),
				rt = n(30),
				pt = n(80),
				jt = n.n(pt),
				dt = n(316),
				ut = n.n(dt),
				ft = n(28),
				bt = n(317),
				ht = n(41),
				Ot = (n(1829), n(3)),
				mt = ht.a.div(Ie || (Ie = Object(tt.a)(['\n  display: flex;\n  align-items: center;\n']))),
				xt = ht.a.img(
					Ee || (Ee = Object(tt.a)(['\n  width: 35px; /* 80% */\n  height: 32px;\n  margin-right: 10px;\n'])),
				),
				gt = Object(ht.a)(it.a)(
					Re || (Re = Object(tt.a)(['\n  color: #ffffff !important;\n  margin: 4px 0px !important;\n'])),
				),
				zt = Object(ht.a)(ct.a)(
					Ae ||
						(Ae = Object(tt.a)([
							'\n  padding: 0px !important;\n  width: auto !important;\n\n  & svg {\n    width: 100% !important;\n    fill: ',
							' !important;\n  }\n\n  & span {\n    top: -4px !important;\n    right: 28% !important;\n    font-size: 10px !important;\n    width: 18px !important;\n    height: 18px !important;\n  }\n',
						])),
					function (e) {
						return e.color;
					},
				),
				vt = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.locationPathName,
										n = e.muiThemePalette,
										c = Object(et.a)(e, ['locationPathName', 'muiThemePalette']);
									return (
										t === c.containerElement.props.to &&
											((c.style = { color: n.accent1Color }),
											(c.leftIcon = $e.cloneElement(c.leftIcon, { color: n.accent1Color }))),
										Object(Ot.jsx)(rt.ListItem, Object(m.a)({}, c))
									);
								},
							},
						]),
						n
					);
				})($e.Component),
				yt = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.muiThemePalette,
										n = e.app,
										c = e.user,
										o = e.snackbars,
										s = e.currentElection,
										l = e.pendingStallCount,
										i = e.defaultBreakPoint,
										r = e.isResponsiveAndOverBreakPoint,
										p = e.handleSnackbarClose,
										j = e.content,
										u = e.onClickDrawerLink,
										f = e.locationPathName,
										b = -1;
									'/elections' === f
										? (b = 0)
										: '/stalls' === f
											? (b = 1)
											: f === '/election/'.concat(s.id, '/polling_places/') && (b = 2);
									var h = {
											linearProgressStyle: {
												position: 'fixed',
												top: '0px',
												zIndex: 1200,
												display: n.requestsInProgress > 0 ? 'block' : 'none',
											},
										},
										O = {};
									return (
										!0 === r &&
											null !== c &&
											(O.iconElementRight = Object(Ot.jsx)(bt.ToolbarGroup, {
												children: Object(Ot.jsx)(gt, {
													label: c.email,
													icon: Object(Ot.jsx)(ft.ActionFace, { color: 'white' }),
													disabled: !0,
												}),
											})),
										Object(Ot.jsxs)('div', {
											className: 'page',
											children: [
												Object(Ot.jsx)(d.c, {
													breakPoint: i,
													zDepth: 1,
													children: Object(Ot.jsxs)(rt.List, {
														children: [
															Object(Ot.jsx)(vt, {
																primaryText: 'Home',
																leftIcon: Object(Ot.jsx)(ft.ContentDrafts, {}),
																containerElement: Object(Ot.jsx)(a.a, { to: '/' }),
																locationPathName: f,
																muiThemePalette: t,
																onClick: u,
															}),
															!0 === r &&
																Object(Ot.jsxs)('div', {
																	children: [
																		Object(Ot.jsx)(vt, {
																			primaryText: 'Pending Stalls',
																			leftIcon: Object(Ot.jsx)(ft.ContentSend, {}),
																			rightIcon:
																				l > 0 ? Object(Ot.jsx)(ct.a, { badgeContent: l, secondary: !0 }) : void 0,
																			containerElement: Object(Ot.jsx)(a.a, { to: '/stalls' }),
																			locationPathName: f,
																			muiThemePalette: t,
																			onClick: u,
																		}),
																		Object(Ot.jsx)(vt, {
																			primaryText: 'Edit Polling Places',
																			leftIcon: Object(Ot.jsx)(ft.ActionGrade, {}),
																			containerElement: Object(Ot.jsx)(a.a, {
																				to: '/election/'.concat(s.id, '/polling_places/'),
																			}),
																			locationPathName: f,
																			muiThemePalette: t,
																			onClick: u,
																		}),
																		Object(Ot.jsx)(vt, {
																			primaryText: 'Election Management',
																			leftIcon: Object(Ot.jsx)(ft.ContentInbox, {}),
																			containerElement: Object(Ot.jsx)(a.a, { to: '/elections' }),
																			locationPathName: f,
																			muiThemePalette: t,
																			onClick: u,
																		}),
																	],
																}),
															Object(Ot.jsx)(vt, {
																primaryText: 'Favourited Polling Places',
																leftIcon: Object(Ot.jsx)(ft.ToggleStar, {}),
																containerElement: Object(Ot.jsx)(a.a, {
																	to: '/election/'.concat(s.id, '/favourited_polling_places'),
																}),
																locationPathName: f,
																muiThemePalette: t,
																onClick: u,
															}),
															Object(Ot.jsx)(vt, {
																primaryText: 'Edit Polling Place Types',
																leftIcon: Object(Ot.jsx)(ft.ContentDrafts, {}),
																containerElement: Object(Ot.jsx)(a.a, {
																	to: '/election/'.concat(s.id, '/polling_place_types'),
																}),
																locationPathName: f,
																muiThemePalette: t,
																onClick: u,
															}),
															Object(Ot.jsx)(rt.ListItem, {
																primaryText: 'democracysausage.org',
																leftIcon: Object(Ot.jsx)(ft.ActionOpenInNew, {}),
																containerElement: Object(Ot.jsx)('a', {
																	href: 'https://democracysausage.org',
																	target: '_blank',
																}),
															}),
															!1 === r && null !== c && Object(Ot.jsx)(at.a, {}),
															!1 === r &&
																null !== c &&
																Object(Ot.jsx)(rt.ListItem, {
																	primaryText: c.email,
																	leftIcon: Object(Ot.jsx)(ft.ActionFace, {}),
																	disabled: !0,
																}),
														],
													}),
												}),
												Object(Ot.jsxs)(d.a, {
													breakPoint: i,
													children: [
														Object(Ot.jsx)(qe.a, {
															mode: 'indeterminate',
															color: t.accent3Color,
															style: h.linearProgressStyle,
														}),
														Object(Ot.jsx)(
															d.b,
															Object(m.a)(
																Object(m.a)(
																	{
																		breakPoint: i,
																		title: Object(Ot.jsxs)(mt, {
																			children: [
																				Object(Ot.jsx)(xt, { src: '/icons/sausage+cake_big.png' }),
																				' Admin Console',
																			],
																		}),
																	},
																	O,
																),
																{},
																{ zDepth: 1 },
															),
														),
														Object(Ot.jsx)('div', { className: 'page-content', children: j || this.props.children }),
														!1 === r &&
															Object(Ot.jsx)(jt.a, {
																zDepth: 1,
																className: 'page-footer',
																children: Object(Ot.jsxs)(ot.BottomNavigation, {
																	selectedIndex: b,
																	children: [
																		Object(Ot.jsx)(ot.BottomNavigationItem, {
																			label: 'Elections',
																			icon: Object(Ot.jsx)(ft.ContentInbox, {}),
																			onClick: function () {
																				return a.d.push('/elections');
																			},
																		}),
																		Object(Ot.jsx)(ot.BottomNavigationItem, {
																			label: 'Pending Stalls',
																			icon:
																				l > 0
																					? Object(Ot.jsx)(zt, {
																							badgeContent: l,
																							secondary: !0,
																							children: Object(Ot.jsx)(ft.ContentSend, {}),
																						})
																					: Object(Ot.jsx)(ft.ContentSend, {}),
																			onClick: function () {
																				return a.d.push('/stalls');
																			},
																		}),
																		Object(Ot.jsx)(ot.BottomNavigationItem, {
																			label: 'Polling Places',
																			icon: Object(Ot.jsx)(ft.ActionGrade, {}),
																			onClick: function () {
																				return a.d.push('/election/'.concat(s.id, '/polling_places/'));
																			},
																		}),
																	],
																}),
															}),
													],
												}),
												Object(Ot.jsx)(ut.a, {
													open: o.open,
													message: o.active.message,
													action: o.active.action,
													autoHideDuration: o.active.autoHideDuration,
													onActionClick: function () {
														'onActionClick' in o.active && o.active.onActionClick();
													},
													onRequestClose: p,
												}),
											],
										})
									);
								},
							},
						]),
						n
					);
				})($e.Component),
				Ct = n(214),
				Mt = n.n(Ct),
				_t = n(98),
				wt = n.n(_t),
				kt = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						var e;
						Object(Ge.a)(this, n);
						for (var c = arguments.length, o = new Array(c), s = 0; s < c; s++) o[s] = arguments[s];
						return (
							((e = t.call.apply(t, [this].concat(o))).handleClick = function () {
								window.location.href = e.props.providerUrl;
							}),
							e
						);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.providerName,
										n = e.colour;
									return Object(Ot.jsx)(wt.a, {
										label: t,
										style: { margin: 12, display: 'block' },
										backgroundColor: n,
										labelColor: '#ffffff',
										onClick: this.handleClick,
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				Pt = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.open;
									return Object(Ot.jsx)(Mt.a, {
										title: 'Please login to access Democracy Sausage',
										modal: !0,
										open: e,
										children: Object(Ot.jsx)(kt, {
											providerName: 'Google',
											providerUrl: ''.concat('https://admin.staging.democracysausage.org/api', '/login/google-oauth2/'),
											colour: '#DD4B39',
										}),
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				Tt = Xe()({
					palette: {
						primary1Color: Je.deepPurple500,
						primary2Color: Je.deepPurple400,
						primary3Color: Je.deepPurple100,
						accent1Color: Je.deepPurple500,
						accent2Color: Je.deepPurple400,
						accent3Color: Je.deepPurple300,
						textColor: Je.fullBlack,
						alternateTextColor: Je.white,
						canvasColor: Je.white,
						borderColor: Je.deepPurple100,
						disabledColor: Object(Ze.fade)(Je.fullBlack, 0.5),
						pickerHeaderColor: Je.deepPurple300,
						clockCircleColor: Object(Ze.fade)(Je.yellow500, 0.07),
						shadowColor: Je.fullBlack,
					},
					appBar: { height: 50 },
				}),
				St = 'small';
			function It(e, t) {
				var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : St;
				return e.greaterThan[n] && t.responsive;
			}
			var Et,
				Rt,
				At,
				Lt,
				Dt,
				Ut,
				Nt,
				Ft,
				Gt,
				Wt = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						var e;
						Object(Ge.a)(this, n);
						for (var c = arguments.length, o = new Array(c), s = 0; s < c; s++) o[s] = arguments[s];
						return ((e = t.call.apply(t, [this].concat(o))).intervalId = void 0), e;
					}
					return (
						Object(We.a)(n, [
							{
								key: 'UNSAFE_componentWillMount',
								value: function () {
									var e = this.props,
										t = e.setElectionFromRoute,
										n = e.fetchInitialAppState;
									'params' in this.props &&
										'electionIdentifier' in this.props.params &&
										t(parseInt(this.props.params.electionIdentifier, 10)),
										n();
								},
							},
							{
								key: 'componentDidMount',
								value: function () {
									var e = this;
									this.intervalId = window.setInterval(
										function () {
											e.props.refreshPendingStalls();
										},
										!0 === Se() ? 3e5 : 3e4,
									);
								},
							},
							{
								key: 'componentWillUnmount',
								value: function () {
									void 0 !== this.intervalId && window.clearInterval(this.intervalId);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.app,
										n = e.user,
										c = e.snackbars,
										o = e.currentElection,
										s = e.pendingStallCount,
										a = e.browser,
										l = e.responsiveDrawer,
										i = e.handleSnackbarClose,
										r = e.onClickDrawerLink,
										p = e.location,
										j = e.children,
										d = e.content;
									return !0 === t.loading
										? Object(Ot.jsx)(Qe.a, {
												muiTheme: Tt,
												children: Object(Ot.jsx)('div', {
													style: { backgroundColor: Tt.palette.primary1Color, width: '100%', height: '100%' },
													children: Object(Ot.jsx)(qe.a, { mode: 'indeterminate', color: Tt.palette.accent3Color }),
												}),
											})
										: null === n
											? Object(Ot.jsx)(Qe.a, { muiTheme: Tt, children: Object(Ot.jsx)(Pt, { open: !0 }) })
											: Object(Ot.jsx)(Qe.a, {
													muiTheme: Tt,
													children: Object(Ot.jsx)(yt, {
														muiThemePalette: Tt.palette,
														app: t,
														user: n,
														snackbars: c,
														currentElection: o,
														pendingStallCount: s,
														defaultBreakPoint: St,
														isResponsiveAndOverBreakPoint: It(a, l),
														handleSnackbarClose: i,
														children: j,
														content: d,
														onClickDrawerLink: r,
														locationPathName: p.pathname,
													}),
												});
								},
							},
						]),
						n
					);
				})($e.Component),
				Bt = Object(s.b)(
					function (e) {
						var t = e.app,
							n = e.user,
							c = e.snackbars,
							o = e.elections,
							s = e.stalls,
							a = e.browser,
							l = e.responsiveDrawer;
						return (
							s.pending.length > 0
								? (document.title = '('.concat(s.pending.length, ') Democracy Sausage Admin Console'))
								: (document.title = 'Democracy Sausage Admin Console'),
							{
								app: t,
								user: n.user,
								snackbars: c,
								currentElection: o.elections.find(function (e) {
									return e.id === o.current_election_id;
								}),
								pendingStallCount: s.pending.length,
								browser: a,
								responsiveDrawer: l,
							}
						);
					},
					function (e) {
						return {
							setElectionFromRoute: function (t) {
								e(U(t));
							},
							fetchInitialAppState: function () {
								e(
									(function () {
										var e = Object(h.a)(
											b.a.mark(function e(t, n, c) {
												var o;
												return b.a.wrap(function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	t({ type: ve }),
																	(e.next = 3),
																	t(
																		(function () {
																			var e = Object(h.a)(
																				b.a.mark(function e(t, n, c) {
																					var o, s, a;
																					return b.a.wrap(function (e) {
																						for (;;)
																							switch ((e.prev = e.next)) {
																								case 0:
																									return (e.next = 2), c.get('/0.1/self', t);
																								case 2:
																									if (
																										((o = e.sent), (s = o.response), (a = o.json), 200 !== s.status)
																									) {
																										e.next = 8;
																										break;
																									}
																									return t({ type: xe, user: a.user || null }), e.abrupt('return', a);
																								case 8:
																								case 'end':
																									return e.stop();
																							}
																					}, e);
																				}),
																			);
																			return function (t, n, c) {
																				return e.apply(this, arguments);
																			};
																		})(),
																	)
																);
															case 3:
																if (!(o = e.sent) || !o.is_logged_in) {
																	e.next = 7;
																	break;
																}
																return (
																	(e.next = 7),
																	Promise.all([
																		t(
																			(function () {
																				var e = Object(h.a)(
																					b.a.mark(function e(t, n, c) {
																						var o, s, a, l, i, r;
																						return b.a.wrap(function (e) {
																							for (;;)
																								switch ((e.prev = e.next)) {
																									case 0:
																										return (e.next = 2), c.get('/0.1/elections/', t);
																									case 2:
																										(o = e.sent),
																											(s = o.response),
																											(a = o.json),
																											200 === s.status &&
																												(t({ type: T, elections: a }),
																												void 0 === n().elections.current_election_id &&
																													(void 0 !==
																													(i = a.find(function (e) {
																														return e.is_primary;
																													}))
																														? (l = i)
																														: ((r = a.find(function (e) {
																																return W(e);
																															})),
																															(l = void 0 !== r ? r : a[0])),
																													t(U(l.id))));
																									case 6:
																									case 'end':
																										return e.stop();
																								}
																						}, e);
																					}),
																				);
																				return function (t, n, c) {
																					return e.apply(this, arguments);
																				};
																			})(),
																		),
																		t(ue()),
																		t(
																			(function () {
																				var e = Object(h.a)(
																					b.a.mark(function e(t, n, c) {
																						var o, s, a;
																						return b.a.wrap(function (e) {
																							for (;;)
																								switch ((e.prev = e.next)) {
																									case 0:
																										return (
																											(e.next = 2), c.get('/0.1/polling_places_facility_types/', t)
																										);
																									case 2:
																										(o = e.sent),
																											(s = o.response),
																											(a = o.json),
																											200 === s.status && t({ type: H, pollingPlaceTypes: a });
																									case 6:
																									case 'end':
																										return e.stop();
																								}
																						}, e);
																					}),
																				);
																				return function (t, n, c) {
																					return e.apply(this, arguments);
																				};
																			})(),
																		),
																	])
																);
															case 7:
																t({ type: ye });
															case 8:
															case 'end':
																return e.stop();
														}
												}, e);
											}),
										);
										return function (t, n, c) {
											return e.apply(this, arguments);
										};
									})(),
								);
							},
							refreshPendingStalls: function () {
								e(ue(!0));
							},
							handleSnackbarClose: function (t) {
								'timeout' === t && e(w());
							},
							onClickDrawerLink: function () {
								e(Object(d.e)(!1));
							},
						};
					},
				)(Wt),
				Vt = n(576),
				Ht = n(150),
				qt = n(573),
				Jt = n(574),
				Kt = n(96),
				Xt = n(122),
				Yt = n(447),
				Qt = n(7),
				Zt = n(91),
				$t = n(217),
				en = n(602),
				tn = n(344),
				nn = n(599),
				cn = (n(1896), n(600)),
				on = n(283),
				sn = n(146),
				an = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						var e;
						Object(Ge.a)(this, n);
						for (var c = arguments.length, o = new Array(c), s = 0; s < c; s++) o[s] = arguments[s];
						return ((e = t.call.apply(t, [this].concat(o))).map = void 0), e;
					}
					return (
						Object(We.a)(n, [
							{
								key: 'componentDidMount',
								value: function () {
									if (
										((this.map = new nn.a({
											layers: [
												new en.a({
													source: new cn.a({
														attributions: [
															'\xa9 <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap contributors</a>',
														],
													}),
												}),
											],
											target: 'map',
											view: new sn.a({ center: [13668163.65, -2988993.54], zoom: 3 }),
										})),
										void 0 !== this.props.value)
									) {
										var e = this.map.getView(),
											t = new Zt.a(this.props.value.coordinates).transform('EPSG:4326', 'EPSG:3857');
										e.fit(t, { size: this.map.getSize() });
									}
									var n = this.createDrawingVectorLayer();
									this.createDrawingInteraction(n);
								},
							},
							{
								key: 'createDrawingVectorLayer',
								value: function () {
									if (void 0 !== this.map) {
										var e;
										e =
											void 0 !== this.props.value
												? new on.a({
														wrapX: !1,
														features: new Yt.a().readFeatures(this.props.value, {
															featureProjection: 'EPSG:3857',
															dataProjection: 'EPSG:4326',
														}),
													})
												: new on.a({ wrapX: !1 });
										var t = new tn.a({ source: e });
										return t.setProperties({ owner: 'drawing-interaction' }), this.map.addLayer(t), e;
									}
									return null;
								},
							},
							{
								key: 'createDrawingInteraction',
								value: function (e) {
									var t = this;
									if (void 0 !== this.map && null !== e) {
										var n = new $t.b({ source: e, type: Qt.a.CIRCLE, geometryFunction: Object($t.a)() });
										n.on('drawstart', function (t) {
											e.clear();
										}),
											n.on('drawend', function (e) {
												var n = new Yt.a().writeFeatureObject(e.feature, {
													featureProjection: 'EPSG:3857',
													dataProjection: 'EPSG:4326',
												});
												t.props.onChange(n.geometry);
											}),
											this.map.addInteraction(n);
									}
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props.elections;
									return Object(Ot.jsxs)($e.Fragment, {
										children: [
											Object(Ot.jsx)('div', {
												id: 'map',
												style: { width: 400, height: 300, paddingTop: 20, paddingBottom: 20 },
											}),
											Object(Ot.jsx)('div', { children: 'OR' }),
											Object(Ot.jsx)(Xt.e, {
												floatingLabelText: 'Use existing geometry',
												onChange: function (t, n, c) {
													return e.props.onChange(JSON.parse(c));
												},
												children: t.map(function (e) {
													return Object(Ot.jsx)(Xt.d, { value: JSON.stringify(e.geom), primaryText: e.name }, e.id);
												}),
											}),
										],
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				ln = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.elections,
										n = e.value,
										c = e.onChange;
									return Object(Ot.jsx)(an, { elections: t, value: n, onChange: c });
								},
							},
						]),
						n
					);
				})($e.Component),
				rn = Object(s.b)(
					function (e, t) {
						return { elections: e.elections.elections };
					},
					function (e) {
						return {};
					},
				)(ln),
				pn = function (e) {
					return e ? void 0 : 'Required';
				},
				jn = Object(ht.a)(Kt.Checkbox)(Et || (Et = Object(tt.a)(['\n  margin-bottom: 16px;\n']))),
				dn = Object(ht.a)(wt.a)(Rt || (Rt = Object(tt.a)(['\n  margin: 8px;\n']))),
				un = ht.a.button(At || (At = Object(tt.a)(['\n  display: none;\n']))),
				fn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Ot.jsx)(qt.a, Object(m.a)({ autoComplete: 'off' }, this.props));
								},
							},
						]),
						n
					);
				})($e.Component),
				bn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.isDirty,
										c = e.onSaveForm,
										o = e.onCancelForm,
										s = e.handleSubmit,
										a = e.onSubmit;
									return Object(Ot.jsxs)('form', {
										onSubmit: s(a),
										children: [
											Object(Ot.jsx)(fn, {
												name: 'name',
												component: Kt.TextField,
												floatingLabelText: 'The name of the election (e.g. Federal Election 2018)',
												fullWidth: !0,
												validate: [pn],
											}),
											Object(Ot.jsx)(fn, {
												name: 'short_name',
												component: Kt.TextField,
												floatingLabelText: 'A short name for this election (e.g. FED 2018)',
												fullWidth: !0,
												validate: [pn],
											}),
											Object(Ot.jsx)(fn, {
												name: 'election_day',
												component: Kt.DatePicker,
												format: function (e) {
													return '' === e ? null : e;
												},
												floatingLabelText: 'What day is election day?',
												fullWidth: !0,
												mode: 'landscape',
												required: !0,
											}),
											Object(Ot.jsx)(qt.a, {
												name: 'geom',
												component: function (e) {
													return Object(Ot.jsx)(rn, {
														value: '' !== e.input.value ? e.input.value : void 0,
														onChange: function (t) {
															return e.input.onChange(t);
														},
													});
												},
											}),
											Object(Ot.jsx)(fn, {
												name: 'is_hidden',
												component: jn,
												label: 'Hide election?',
												labelPosition: 'right',
											}),
											Object(Ot.jsx)(dn, {
												label: null === t ? 'Create' : 'Save',
												disabled: !n,
												primary: !0,
												onClick: c,
											}),
											Object(Ot.jsx)(dn, { label: 'Cancel', primary: !1, onClick: o }),
											Object(Ot.jsx)(un, { type: 'submit' }),
											null !== t &&
												Object(Ot.jsxs)($e.Fragment, {
													children: [
														Object(Ot.jsx)('br', {}),
														Object(Ot.jsx)('br', {}),
														Object(Ot.jsx)('img', {
															src: ''
																.concat('https://admin.staging.democracysausage.org/api', '/0.1/map_image/')
																.concat(t.id, '/'),
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
				})($e.PureComponent),
				hn = Object(Jt.a)({ form: 'election', enableReinitialize: !0, onChange: function (e, t, n) {} })(bn),
				On = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.onElectionCreated,
										n = e.isDirty,
										c = e.onFormSubmit,
										o = e.onSaveForm;
									return Object(Ot.jsx)(hn, {
										election: null,
										initialValues: {},
										isDirty: n,
										onSubmit: function (e, n, o) {
											c(e, t);
										},
										onSaveForm: function () {
											o(n);
										},
										onCancelForm: function () {
											a.d.push('/elections/');
										},
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				mn = Object(s.b)(
					function (e, t) {
						return { isDirty: Object(Vt.a)('election')(e) };
					},
					function (e) {
						return {
							onFormSubmit: function (t, n) {
								return Object(h.a)(
									b.a.mark(function n() {
										var c;
										return b.a.wrap(function (n) {
											for (;;)
												switch ((n.prev = n.next)) {
													case 0:
														return (
															(c = {
																geom: (o = t).geom,
																name: o.name,
																short_name: o.short_name,
																is_hidden: o.is_hidden,
																election_day: o.election_day,
															}),
															(n.next = 3),
															e(F(c))
														);
													case 3:
														n.sent && a.d.push('/elections/');
													case 5:
													case 'end':
														return n.stop();
												}
											var o;
										}, n);
									}),
								)();
							},
							onSaveForm: function (t) {
								e(Object(Ht.a)('election'));
							},
						};
					},
				)(On),
				xn = n(1955),
				gn = function (e) {
					var t = z.DateTime.fromJSDate(e.election_day),
						n = z.DateTime.utc(t.get('year'), t.get('month'), t.get('day'));
					return {
						geom: e.geom,
						name: e.name,
						short_name: e.short_name,
						is_hidden: e.is_hidden,
						election_day: n.toISO(),
					};
				},
				zn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						var e;
						Object(Ge.a)(this, n);
						for (var c = arguments.length, o = new Array(c), s = 0; s < c; s++) o[s] = arguments[s];
						return ((e = t.call.apply(t, [this].concat(o))).initialValues = void 0), e;
					}
					return (
						Object(We.a)(n, [
							{
								key: 'UNSAFE_componentWillMount',
								value: function () {
									var e = this.props.election;
									this.initialValues = Object(xn.a)(
										(function (e) {
											return {
												geom: e.geom,
												name: e.name,
												short_name: e.short_name,
												is_hidden: e.is_hidden,
												election_day: new Date(e.election_day),
											};
										})(e),
									);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.onElectionEdited,
										c = e.isDirty,
										o = e.onFormSubmit,
										s = e.onSaveForm;
									return Object(Ot.jsx)(hn, {
										election: t,
										initialValues: this.initialValues,
										isDirty: c,
										onSubmit: function (e, c, s) {
											o(e, t, n);
										},
										onSaveForm: function () {
											s(t, c);
										},
										onCancelForm: function () {
											a.d.push('/elections/');
										},
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				vn = Object(s.b)(
					function (e, t) {
						return {
							election: e.elections.elections.find(function (e) {
								return e.id === parseInt(t.params.electionIdentifier, 10);
							}),
							isDirty: Object(Vt.a)('election')(e),
						};
					},
					function (e) {
						return {
							onFormSubmit: function (t, n, c) {
								return Object(h.a)(
									b.a.mark(function c() {
										var o;
										return b.a.wrap(function (c) {
											for (;;)
												switch ((c.prev = c.next)) {
													case 0:
														return (o = gn(t)), (c.next = 3), e(G(n, o));
													case 3:
														c.sent && a.d.push('/elections/');
													case 5:
													case 'end':
														return c.stop();
												}
										}, c);
									}),
								)();
							},
							onSaveForm: function (t, n) {
								e(Object(Ht.a)('election'));
							},
						};
					},
				)(zn),
				yn = n(176),
				Cn = n(280),
				Mn = n.n(Cn),
				_n = n(442),
				wn = n.n(_n),
				kn = n(443),
				Pn = n.n(kn),
				Tn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return (
							Object(Ge.a)(this, n),
							((c = t.call(this, e)).onFileChange = void 0),
							(c.onConfigChange = void 0),
							(c.onCheckDryRun = void 0),
							(c.onFileChange = c.uploadFile.bind(Object(yn.a)(c))),
							(c.onConfigChange = c.props.onConfigChange.bind(Object(yn.a)(c))),
							(c.onCheckDryRun = c.props.onCheckDryRun.bind(Object(yn.a)(c))),
							c
						);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'uploadFile',
								value: function (e) {
									void 0 !== e.target.files[0] && this.props.onFileUpload(e.target.files[0]);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.file,
										c = e.job_id,
										o = e.job_status,
										s = e.stages_log,
										l = e.error,
										i = e.messages;
									return Object(Ot.jsxs)('div', {
										children: [
											Object(Ot.jsx)('h1', { children: t.name }),
											Object(Ot.jsx)(Xt.f, {
												name: 'config',
												multiLine: !0,
												floatingLabelText: 'JSON config',
												hintText: 'JSON config to use during polling places ingest',
												fullWidth: !0,
												onChange: this.onConfigChange,
											}),
											Object(Ot.jsx)('br', {}),
											Object(Ot.jsx)('br', {}),
											Object(Ot.jsx)(Xt.b, { label: 'Dry run?', defaultChecked: !0, onCheck: this.onCheckDryRun }),
											Object(Ot.jsx)('br', {}),
											Object(Ot.jsx)('br', {}),
											Object(Ot.jsx)(wt.a, {
												containerElement: 'label',
												icon: Object(Ot.jsx)(Pn.a, {}),
												label: 'Choose polling place CSV file to upload',
												labelColor: 'white',
												primary: !0,
												children: Object(Ot.jsx)('input', {
													onChange: this.onFileChange,
													style: { display: 'none' },
													type: 'file',
												}),
											}),
											void 0 !== n &&
												Object(Ot.jsx)(rt.ListItem, {
													primaryText: ''.concat(n.name, ' (').concat(n.type, ')'),
													secondaryText: ''.concat((n.size / 1048576).toFixed(3), 'MB'),
													leftIcon: Object(Ot.jsx)(wn.a, {}),
													disabled: !0,
												}),
											void 0 !== c &&
												Object(Ot.jsx)(rt.ListItem, {
													primaryText: 'Job ID: '.concat(c),
													leftIcon: Object(Ot.jsx)(ft.ActionInfoOutline, {}),
													disabled: !0,
												}),
											void 0 !== o &&
												Object(Ot.jsx)(rt.ListItem, {
													primaryText: 'Job status: '.concat(o),
													leftIcon: Object(Ot.jsx)(ft.ActionInfoOutline, {}),
													disabled: !0,
												}),
											void 0 !== s &&
												s.length > 0 &&
												Object(Ot.jsx)(Xt.c, {
													children: s.map(function (e, t) {
														return Object(Ot.jsx)(
															rt.ListItem,
															{ primaryText: e, leftIcon: Object(Ot.jsx)(ft.HardwareKeyboardArrowRight, {}) },
															e,
														);
													}),
												}),
											void 0 !== i &&
												!0 === l &&
												Object(Ot.jsxs)($e.Fragment, {
													children: [
														Object(Ot.jsx)(rt.ListItem, {
															primaryText:
																'There was a problem loading the polling places. Please review the logs below for further information.',
															leftIcon: Object(Ot.jsx)(Mn.a, { color: Je.red500 }),
															disabled: !0,
														}),
														Object(Ot.jsx)('h2', { children: i.message }),
													],
												}),
											!1 === l &&
												Object(Ot.jsxs)('div', {
													children: [
														Object(Ot.jsx)(rt.ListItem, {
															primaryText: 'Polling places have been loaded successfully.',
															leftIcon: Object(Ot.jsx)(Mn.a, { color: Je.greenA200 }),
															disabled: !0,
														}),
														Object(Ot.jsx)(wt.a, {
															label: 'Yay! \ud83d\udc4f',
															primary: !0,
															containerElement: Object(Ot.jsx)(a.a, { to: '/elections/' }),
														}),
													],
												}),
											void 0 !== i &&
												i.logs.info.length > 0 &&
												Object(Ot.jsxs)('div', {
													children: [
														Object(Ot.jsx)('h2', { children: 'Info' }),
														Object(Ot.jsx)(Xt.c, {
															children: i.logs.info.map(function (e, t) {
																return Object(Ot.jsx)(
																	rt.ListItem,
																	{ primaryText: e, leftIcon: Object(Ot.jsx)(ft.ActionInfo, {}), disabled: !0 },
																	t,
																);
															}),
														}),
													],
												}),
											void 0 !== i &&
												i.logs.errors.length > 0 &&
												Object(Ot.jsxs)('div', {
													children: [
														Object(Ot.jsx)('h2', { children: 'Errors' }),
														Object(Ot.jsx)(Xt.c, {
															children: i.logs.errors.map(function (e, t) {
																return Object(Ot.jsx)(
																	rt.ListItem,
																	{ primaryText: e, leftIcon: Object(Ot.jsx)(Mn.a, {}), disabled: !0 },
																	t,
																);
															}),
														}),
													],
												}),
											void 0 !== i &&
												i.logs.warnings.length > 0 &&
												Object(Ot.jsxs)('div', {
													children: [
														Object(Ot.jsx)('h2', { children: 'Warnings' }),
														Object(Ot.jsx)(Xt.c, {
															children: i.logs.warnings.map(function (e, t) {
																return Object(Ot.jsx)(
																	rt.ListItem,
																	{ primaryText: e, leftIcon: Object(Ot.jsx)(ft.AlertWarning, {}), disabled: !0 },
																	t,
																);
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
				})($e.PureComponent),
				Sn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return (
							Object(Ge.a)(this, n),
							((c = t.call(this, e)).state = {
								file: void 0,
								config: void 0,
								dryRun: !0,
								intervalId: void 0,
								job_id: void 0,
								job_status: void 0,
								stages_log: void 0,
								error: void 0,
								messages: void 0,
							}),
							c
						);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props,
										n = t.election,
										c = t.loadPollingPlaces;
									return Object(Ot.jsx)(Tn, {
										election: n,
										file: this.state.file,
										error: this.state.error,
										job_id: this.state.job_id,
										job_status: this.state.job_status,
										stages_log: this.state.stages_log,
										messages: this.state.messages,
										onFileUpload: function (t) {
											e.setState(Object(m.a)(Object(m.a)({}, e.state), {}, { file: t })),
												c(n, t, e.state.config, e.state.dryRun, e);
										},
										onConfigChange: function (t, n) {
											try {
												JSON.parse(n), e.setState(Object(m.a)(Object(m.a)({}, e.state), {}, { config: n }));
											} catch (c) {
												console.error(c);
											}
										},
										onCheckDryRun: function (t, n) {
											e.setState(Object(m.a)(Object(m.a)({}, e.state), {}, { dryRun: n }));
										},
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				In = Object(s.b)(
					function (e, t) {
						return {
							election: e.elections.elections.find(function (e) {
								return e.id === parseInt(t.params.electionIdentifier, 10);
							}),
						};
					},
					function (e) {
						return {
							loadPollingPlaces: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n, c, o, s, a) {
										var l, i, r;
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(ee(n, c, o, s));
													case 2:
														null !== (l = t.sent) &&
															((i = l.job_id),
															(r = window.setInterval(function () {
																a.props.fetchPollingPlaceLoaderJobStatus(n, i, a);
															}, 5e3)),
															a.setState(
																Object(m.a)(
																	Object(m.a)({}, a.state),
																	{},
																	{
																		intervalId: r,
																		job_id: i,
																		job_status: void 0,
																		stages_log: void 0,
																		error: void 0,
																		messages: void 0,
																	},
																),
															));
													case 4:
													case 'end':
														return t.stop();
												}
										}, t);
									}),
								);
								return function (e, n, c, o, s) {
									return t.apply(this, arguments);
								};
							})(),
							fetchPollingPlaceLoaderJobStatus: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n, c, o) {
										var s;
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(te(n, c));
													case 2:
														(s = t.sent),
															o.setState(
																Object(m.a)(
																	Object(m.a)({}, o.state),
																	{},
																	{
																		job_status: s.status,
																		stages_log: null !== s.stages_log ? s.stages_log : void 0,
																		error:
																			null !== s.response
																				? !!('errors' in s.response.logs && s.response.logs.errors.length > 0)
																				: void 0,
																		messages: null !== s.response ? s.response : void 0,
																	},
																),
															),
															['finished', 'failed', 'stopped', 'canceled', 'cancelled'].includes(s.status) &&
																window.clearInterval(o.state.intervalId);
													case 5:
													case 'end':
														return t.stop();
												}
										}, t);
									}),
								);
								return function (e, n, c) {
									return t.apply(this, arguments);
								};
							})(),
						};
					},
				)(Sn),
				En = n(56),
				Rn = n.n(En),
				An = n(177),
				Ln = Object(ht.a)(An.TableRow)(Lt || (Lt = Object(tt.a)(['\n  border-bottom: none !important;\n']))),
				Dn = Object(ht.a)(An.TableRowColumn)(Dt || (Dt = Object(tt.a)(['\n  overflow: visible !important;\n']))),
				Un = Object(ht.a)(An.TableRowColumn)(Ut || (Ut = Object(tt.a)(['\n  padding-left: 0px !important;\n']))),
				Nn = Object(ht.a)(qe.a)(Nt || (Nt = Object(tt.a)(['\n  height: 10px !important;\n']))),
				Fn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return (
							Object(Ge.a)(this, n),
							((c = t.call(this, e)).onClickElection = void 0),
							(c.onClickFileUpload = void 0),
							(c.onMakeElectionPrimary = void 0),
							(c.onClickElection = function (e) {
								a.d.push('/election/'.concat(e.id, '/'));
							}),
							(c.onClickFileUpload = function (e) {
								a.d.push('/election/'.concat(e.id, '/load_polling_places/'));
							}),
							(c.onMakeElectionPrimary = function (e) {
								c.props.onMakeElectionPrimary(e.id);
							}),
							c
						);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props,
										n = t.elections,
										c = t.onDownloadElection,
										o = t.onRegenerateMapDataForElection;
									return Object(Ot.jsxs)('div', {
										children: [
											Object(Ot.jsx)(wt.a, {
												label: 'Create Election',
												primary: !0,
												containerElement: Object(Ot.jsx)(a.a, { to: '/election/new' }),
											}),
											Object(Ot.jsx)(An.Table, {
												selectable: !1,
												children: Object(Ot.jsx)(An.TableBody, {
													displayRowCheckbox: !1,
													children: n.map(function (t) {
														var n = (t.stats.with_data / t.stats.total) * 100;
														return Object(Ot.jsxs)(
															Ln,
															{
																selectable: !1,
																children: [
																	Object(Ot.jsxs)(Un, {
																		children: [
																			Object(Ot.jsx)(rt.ListItem, {
																				primaryText: t.name,
																				secondaryText: new Date(t.election_day).toLocaleDateString('en-AU', {
																					weekday: 'long',
																					day: '2-digit',
																					month: 'long',
																					year: 'numeric',
																				}),
																				onClick: e.onClickElection.bind(e, t),
																			}),
																			!0 === t.polling_places_loaded &&
																				Object(Ot.jsx)('div', {
																					title: ''
																						.concat(t.stats.with_data, ' of ')
																						.concat(t.stats.total, ' polling places have data (')
																						.concat(Math.round(n), '%)'),
																					children: Object(Ot.jsx)(Nn, { mode: 'determinate', value: n }),
																				}),
																		],
																	}),
																	Object(Ot.jsxs)(Dn, {
																		children: [
																			!0 === t.is_primary &&
																				Object(Ot.jsx)(Rn.a, {
																					tooltip: 'This election is the primary election',
																					onClick: e.onMakeElectionPrimary.bind(e, t),
																					children: Object(Ot.jsx)(ft.ToggleStar, { color: Je.yellow600 }),
																				}),
																			!1 === t.is_primary &&
																				Object(Ot.jsx)(Rn.a, {
																					tooltip: 'Make this election the primary election',
																					onClick: e.onMakeElectionPrimary.bind(e, t),
																					children: Object(Ot.jsx)(ft.ToggleStarBorder, { hoverColor: Je.yellow600 }),
																				}),
																			t.is_hidden
																				? Object(Ot.jsx)(Rn.a, {
																						tooltip: 'This election is hidden - only admins can see it',
																						children: Object(Ot.jsx)(ft.ImageRemoveRedEye, { color: Je.red600 }),
																					})
																				: null,
																		],
																	}),
																	Object(Ot.jsxs)(Dn, {
																		children: [
																			Object(Ot.jsx)(Rn.a, {
																				tooltip: 'Load a new polling places file',
																				onClick: e.onClickFileUpload.bind(e, t),
																				children: Object(Ot.jsx)(ft.FileFileUpload, {}),
																			}),
																			Object(Ot.jsx)(Rn.a, {
																				tooltip: 'Download this election as an Excel file',
																				onClick: c.bind(e, t),
																				children: Object(Ot.jsx)(ft.FileCloudDownload, {}),
																			}),
																			Object(Ot.jsx)(Rn.a, {
																				tooltip: 'Refresh the map data for this election',
																				onClick: o.bind(e, t),
																				children: Object(Ot.jsx)(ft.NavigationRefresh, {}),
																			}),
																		],
																	}),
																],
															},
															t.id,
														);
													}),
												}),
											}),
										],
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Gn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.elections,
										n = e.onMakeElectionPrimary,
										c = e.onDownloadElection,
										o = e.onRegenerateMapDataForElection;
									return Object(Ot.jsx)(Fn, {
										elections: t,
										onMakeElectionPrimary: n,
										onDownloadElection: c,
										onRegenerateMapDataForElection: o,
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Wn = Object(s.b)(
					function (e) {
						return { elections: L(e) };
					},
					function (e) {
						return {
							onMakeElectionPrimary: function (t) {
								e(
									(function (e) {
										return (function () {
											var t = Object(h.a)(
												b.a.mark(function t(n, c, o) {
													return b.a.wrap(function (t) {
														for (;;)
															switch ((t.prev = t.next)) {
																case 0:
																	return (t.next = 2), o.post('/0.1/elections/'.concat(e, '/set_primary/'), {}, n);
																case 2:
																	200 === t.sent.response.status &&
																		(n(N(e)), n(P('Primary election changed! \ud83c\udf1f\ud83c\udf89')));
																case 5:
																case 'end':
																	return t.stop();
															}
													}, t);
												}),
											);
											return function (e, n, c) {
												return t.apply(this, arguments);
											};
										})();
									})(t),
								);
							},
							onDownloadElection: function (e) {
								window.location.href = ''
									.concat(
										'https://admin.staging.democracysausage.org/api',
										'/0.1/polling_places/?format=csv&election_id=',
									)
									.concat(e.id);
							},
							onRegenerateMapDataForElection: function (t) {
								e(
									(function (e) {
										return (function () {
											var t = Object(h.a)(
												b.a.mark(function t(n, c, o) {
													var s;
													return b.a.wrap(function (t) {
														for (;;)
															switch ((t.prev = t.next)) {
																case 0:
																	return (t.next = 2), o.delete('/0.1/map/clear_cache/', { election_id: e.id }, n);
																case 2:
																	200 !== (s = t.sent).status
																		? n(P('Error clearing polling place data cache'))
																		: 200 === s.status &&
																			n(P('Polling place data is being regenerated! \ud83c\udf2d\ud83c\udf89'));
																case 4:
																case 'end':
																	return t.stop();
															}
													}, t);
												}),
											);
											return function (e, n, c) {
												return t.apply(this, arguments);
											};
										})();
									})(t),
								);
							},
						};
					},
				)(Gn),
				Bn = n(139),
				Vn = n.n(Bn),
				Hn = n(270),
				qn = n.n(Hn),
				Jn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.elections,
										n = e.currentElectionId,
										c = e.onChangeElection;
									return Object(Ot.jsx)(qn.a, {
										floatingLabelText: 'Election',
										style: { width: 'auto' },
										menuStyle: { width: '275px' },
										value: n,
										onChange: c,
										children: t.map(function (e) {
											return Object(Ot.jsx)(Vn.a, { value: e.id, primaryText: e.name }, e.id);
										}),
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Kn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.elections,
										n = e.currentElectionId,
										c = e.onChangeElection,
										o = e.onElectionChanged;
									return Object(Ot.jsx)(Jn, {
										elections: t,
										currentElectionId: n,
										onChangeElection: function (e, t, n) {
											return c(e, t, n, o);
										},
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				Xn = Object(s.b)(
					function (e, t) {
						var n = e.elections;
						return { elections: n.elections, currentElectionId: n.current_election_id };
					},
					function (e) {
						return {
							onChangeElection: function (t, n, c, o) {
								e(U(c)), o(c);
							},
						};
					},
				)(Kn),
				Yn = ht.a.div(
					Ft ||
						(Ft = Object(tt.a)([
							'\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n  height: 100%;\n',
						])),
				),
				Qn = ht.a.div(
					Gt ||
						(Gt = Object(tt.a)([
							'\n  width: 70%;\n  max-width: 300px;\n  text-align: center;\n  align-items: start;\n  opacity: 0.5;\n\n  & > div:first-child > * {\n    width: 125px !important;\n    height: 125px !important;\n  }\n\n  & > div:last-child {\n    margin-top: -5px;\n  }\n',
						])),
				),
				Zn = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.message,
										n = e.icon;
									return Object(Ot.jsx)(Yn, {
										children: Object(Ot.jsxs)(Qn, {
											children: [Object(Ot.jsx)('div', { children: n }), Object(Ot.jsx)('div', { children: t })],
										}),
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				$n = n(117),
				ec = n.n($n),
				tc = n(65),
				nc = n(1),
				cc = n.n(nc),
				oc = n(103),
				sc = Object(oc.a)(function (e) {
					return Object(Ot.jsx)(
						cc.a,
						Object(m.a)(
							Object(m.a)({}, e),
							{},
							{
								children: Object(Ot.jsxs)('svg', {
									viewBox: '0 0 65 46',
									xmlns: 'http://www.w3.org/2000/svg',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.41421',
									children: [
										Object(Ot.jsx)('path', {
											d: 'M41.611 12.138c.23.059.454.113.674.162.635.175 1.201.419 1.704.727.263.18.498.376.713.581.205.229.385.483.542.752.132.263.268.537.415.821.097.229.283.38.557.464.429.136.639.415.62.84-.03.282-.015.561.044.833.02.197.069.387.151.568.338.668.845 1.142 1.534 1.425 1.112.488 2.231.752 3.354.786 1.118.074 2.128-.156 3.027-.684.146-.087.328-.175.543-.272 1.366-.162 2.621.302 3.763 1.396.177.156.343.307.499.444.405.347.576.806.518 1.387-.074.488-.21.893-.41 1.225-.02-.077-.035-.171-.04-.279-.063-.248-.17-.512-.322-.795-.137-.25-.25-.611-.342-1.075-.274.04-.64-.112-1.089-.443-.474-.392-.796-.645-.976-.763-.123-.054-.479-.107-1.065-.165-.536-.035-.928-.04-1.171-.01-.338.044-.709.185-1.124.43-.415.278-.669.41-.756.4-1.28.103-2.564-.074-3.858-.532-1.699-.572-2.676-1.435-2.925-2.593-.029-.112-.039-.312-.034-.601.019-.283.01-.513-.025-.693-.067-.342-.248-.552-.546-.625-.361-.107-.66-.327-.894-.66-.078-.111-.19-.41-.346-.892-.127-.435-.23-.714-.299-.84-.371-.45-.825-.786-1.362-1.001-.058-.015-.42-.123-1.074-.318z',
											fill: '#ecb6a3',
										}),
										Object(Ot.jsx)('path', {
											d: 'M6.753 11.743l-.005-.02c.03-.03.068-.059.122-.082-.098 0-.195-.01-.298-.03.024-.005.039-.029.039-.064-.302.117-.683.151-1.137.107-.659-.053-1.143-.018-1.445.098-.084.049-.254.137-.509.264-.219.156-.341.235-.366.24-.083.039-.21.024-.37-.044-.138-.02-.22-.064-.25-.132-.049-.083-.073-.18-.083-.298.582-.337 1.207-.64 1.875-.919.708-.223 1.284-.595 1.734-1.107.336-.356.713-.684 1.138-.986.117.005.224.028.322.072.024-.005.2.074.531.235.264.136.464.195.601.18.118.03.362.025.733-.019.341.019.566.103.679.254.018.029.072.195.151.498.077.327.146.527.215.606.195.234.576.439 1.137.61.444.146.748.195.899.151.336-.005.751.113 1.245.351.185.108.528.313 1.03.62.801.543 1.534.884 2.198 1.032.697.146 1.391.106 2.085-.128.863-.292 1.591-.542 2.172-.747.694-.259 1.304-.493 1.821-.703-.005-.02-.023-.035-.048-.039-.352.019-.82.112-1.402.268-.64.196-1.142.342-1.498.435-1.212.351-2.164.415-2.857.195-.508-.151-1.036-.4-1.582-.746-.518-.353-1.016-.592-1.504-.709-.737-.118-1.294-.224-1.665-.326-.63-.157-1.08-.402-1.347-.738-.04-.049-.089-.148-.152-.299-.068-.161-.117-.267-.142-.321-.151-.21-.464-.396-.938-.557.357.035.733.132 1.138.288.342.162.932.474 1.777.943.743.449 1.475.717 2.193.81.186.025.479.054.884.087.351.054.693.108 1.035.172.752.22 1.553.327 2.402.327.494 0 1.183-.035 2.075-.107.24.01.991.048 2.256.112.894.073 1.563.059 2.003-.049.161-.02.336-.147.522-.391.185-.244.375-.376.572-.405.17-.034.438.02.8.161.381.127.771.157 1.172.083.034-.01.083-.019.151-.039.249.039.493.064.723.079.356-.005.645-.079.855-.23.131-.083.272-.156.424-.225.166-.054.357-.039.586.044.42.147.84.288 1.26.415l.034-.009c.268-.074.458-.191.571-.353.401.157.825.274 1.28.358.571.072 1.132.067 1.684-.02.288-.03.562-.088.816-.166.166-.044.371-.093.61-.147.922-.112 1.797 0 2.622.342.167.088.293.176.375.273.118.244.172.484.172.708.2.02.41.054.64.104l.097.023c.654.2 1.011.308 1.074.323.537.215.991.551 1.362 1.001.069.126.167.405.299.84.151.483.268.781.346.893.234.332.533.552.894.66.298.072.479.282.546.625.035.18.044.41.025.692-.01.289.005.489.034.601.249 1.158 1.226 2.022 2.92 2.593 1.299.459 2.583.635 3.863.532.087.01.336-.122.756-.4.41-.245.786-.386 1.124-.43.243-.03.635-.025 1.171.01.586.058.942.112 1.065.165.175.118.502.372.976.763.449.331.811.484 1.089.444.092.468.205.825.347 1.075.147.287.254.551.317.795.005.107.02.201.04.278-.123.2-.269.382-.43.548-1.069.966-2.295 1.727-3.682 2.28-.132.044-.258.082-.381.116-.205.079-.41.153-.605.215-1.392.484-2.686 1.065-3.882 1.744.195-.21.268-.469.21-.776-.054-.2-.229-.397-.518-.582-.649-.185-1.055-.253-1.225-.21-.245.103-.474.181-.689.239-.356-.121-.63-.185-.825-.19-.068.005-.215.039-.44.098-.22.035-.361.058-.43.063-.165.01-.522-.058-1.058-.2.556-.01 1.127-.137 1.708-.386.757-.302 1.06-.751.913-1.363-.108-.473-.434-.888-.981-1.245-.244-.146-.459-.292-.64-.438 1.026.444 2.138.648 3.326.62.19-.005.517-.093.971-.264.459-.156.82-.249 1.079-.269.069-.005.151-.005.249.005-.298-.235-.557-.346-.777-.351-1.386.087-2.5-.059-3.33-.435-.541-.239-1.132-.713-1.767-1.431-.698-.737-1.215-1.192-1.548-1.362-.21-.102-.488-.196-.85-.278-.41-.069-.717-.132-.907-.185-.753-.172-1.183-.494-1.285-.968-.234-.874-.615-1.421-1.143-1.65-.258-.079-.438-.146-.541-.215-.161-.112-.264-.274-.307-.474-.069-.307.018-.707.267-1.206.245-.474.348-.791.304-.956-.054-.279-.343-.538-.88-.791-.605-.245-.928-.387-.976-.42-.293-.303-.664-.528-1.113-.674-.509-.151-.986-.181-1.446-.098-.298.044-.528.108-.683.185-.147.088-.337.142-.567.172-.156.038-.331.048-.531.013-.269-.057-.484-.097-.645-.111-.708-.089-1.427-.054-2.168.093-.24.043-.625.146-1.152.312-.528.175-.879.279-1.055.298-.548.137-1.03.171-1.445.102-.259-.039-.577-.151-.953-.336-.395-.186-.707-.299-.937-.343-.395-.053-.855-.018-1.373.098-.844.332-1.322.517-1.435.547-.376.122-.957.19-1.744.195-.786.02-1.22.039-1.312.064-.894.42-1.393.644-1.49.669-.088.039-.503-.015-1.245-.151-.859-.128-1.299-.195-1.314-.205-.687-.03-1.21-.152-1.567-.367-.429-.292-.844-.537-1.254-.727-.289-.128-.563-.195-.831-.205-.278.034-.488.044-.639.024-.274-.034-.504-.137-.694-.318-.279-.267-.464-.434-.566-.492-.249-.128-.61-.215-1.094-.264-.41-.059-.879-.039-1.401.054-.548.141-1.006.253-1.383.332h.001zm32.613-.21c-.064.019-.156.088-.269.2-.087.116-.126.195-.116.229.146.284.566.552 1.259.811.689.259 1.055.474 1.089.644.068.304-.049.679-.347 1.119-.327.443-.448.805-.376 1.083.045.244.318.484.826.733.37.176.713.279 1.03.297.157.128.313.24.469.343.405.297.698.61.879.932.351.552.81.913 1.367 1.089.083.024.162.044.234.059.069.126.151.249.244.371.069.073.337.361.806.859.293.332.551.561.776.689.177.122.556.283 1.138.488.561.18.899.318 1.001.395.123.098.484.182 1.074.249.25.03.46.059.635.084.791.195 1.572.244 2.334.146.67-.059 1.128-.289 1.377-.694.161-.258.249-.39.274-.395.097-.132.243-.215.438-.245 0 .015.147.059.43.138.298.087.479.131.538.126.029.015.087-.072.18-.264.138-.156.254-.248.343-.272-.933-.396-1.501-.586-1.701-.566-.077.018-.473.253-1.196.697-.717.445-1.22.674-1.504.689-.522.044-1.137 0-1.831-.136-.82-.202-1.455-.348-1.913-.44-.234-.02-.454-.083-.659-.182-.528-.351-1.055-.736-1.588-1.156-.087-.074-.205-.147-.346-.23-.166-.171-.289-.336-.366-.492-.142-.215-.318-.645-.523-1.28-.205-.547-.512-.859-.919-.943-.566-.064-1.02-.126-1.361-.19-.665-.112-1.035-.307-1.114-.601l-.005-.019c-.048-.225.142-.571.572-1.03.445-.479.64-.845.586-1.094-.074-.362-.605-.698-1.596-1.006-.543-.141-.929-.244-1.163-.297-.391-.089-.645-.167-.757-.23.01-.039.053-.142.132-.308.069-.136.103-.225.093-.259-.024-.053-.059-.102-.098-.151-.044.01-.102.014-.176.01-.063-.015-.131-.015-.2 0z',
											fill: '#da5b5b',
										}),
										Object(Ot.jsx)('path', {
											d: 'M9.883 8.945c-.234-.078-.483-.147-.738-.196-.781-.2-1.371-.238-1.773-.117.02-.019.054-.044.108-.082.342-.2.727-.357 1.167-.474.288-.128.577-.141.869-.039.176.072.361.156.566.244.367.156.748.302 1.148.449.317.127.616.283.894.46.762.468 1.597.83 2.52 1.083.678.215 1.376.377 2.085.483 1.02.196 2.016.317 2.987.366.148.01.299-.004.455-.049.889-.092 1.817-.092 2.788.01.747.098 1.436.079 2.07-.053.332-.064.621-.167.87-.303.151-.069.356-.082.615-.059.747.025 1.489.108 2.221.249.04.015.084.02.133.02-.069.015-.123.029-.152.039-.401.074-.791.043-1.172-.083-.361-.141-.63-.195-.8-.161-.196.029-.386.161-.571.405-.187.24-.363.371-.523.391-.44.108-1.109.121-2.002.049-1.26-.064-2.017-.102-2.257-.113-.888.073-1.581.108-2.07.108-.855 0-1.655-.108-2.407-.328-.341-.063-.684-.117-1.035-.171-.4-.034-.698-.062-.884-.087-.717-.093-1.45-.362-2.192-.81-.845-.469-1.435-.782-1.778-.943-.405-.156-.786-.254-1.142-.289v.001z',
											fill: '#ffdac8',
										}),
										Object(Ot.jsx)('path', {
											d: 'M9.883 8.945c.473.161.786.347.937.557.03.054.074.16.143.321.062.151.116.25.151.299.267.336.717.581 1.347.737.377.103.933.209 1.67.327.483.117.986.356 1.499.708.546.347 1.074.595 1.582.747.693.22 1.645.156 2.862-.195.356-.093.854-.239 1.499-.435.581-.157 1.045-.244 1.401-.268.024.004.039.019.044.039-.518.21-1.123.444-1.822.703-.581.205-1.303.455-2.172.747-.689.234-1.388.274-2.085.128-.66-.148-1.391-.489-2.198-1.032-.497-.307-.845-.512-1.03-.62-.493-.238-.908-.356-1.24-.351-.156.044-.46-.01-.903-.151-.562-.171-.938-.376-1.133-.61-.069-.079-.142-.279-.22-.606-.079-.303-.127-.469-.146-.498-.113-.151-.343-.235-.679-.254-.376.044-.615.049-.732.019-.143.015-.343-.044-.607-.18-.331-.161-.507-.24-.526-.235-.099-.044-.206-.067-.327-.072.053-.064.117-.108.18-.138.396-.121.986-.082 1.772.118.25.048.499.117.733.195zm29.482 2.588c.069-.015.138-.015.2.004.074 0 .133 0 .176-.014.039.049.069.103.098.156.005.034-.024.118-.093.259-.078.161-.122.264-.136.303.111.068.37.141.761.23.234.057.62.156 1.158.297.996.313 1.527.644 1.601 1.01.054.25-.141.611-.591 1.09-.425.464-.615.81-.566 1.035l.005.014c.078.294.448.494 1.113.601.342.069.795.126 1.362.195.406.084.713.396.918.938.205.64.382 1.065.523 1.28.077.156.2.321.366.492.141.083.254.161.346.23.533.42 1.06.805 1.588 1.156.205.103.425.162.659.182.453.097 1.093.243 1.913.44.694.136 1.304.185 1.832.136.283-.015.786-.244 1.503-.689.718-.444 1.119-.679 1.197-.697.2-.02.767.17 1.7.571-.094.024-.205.111-.343.267-.092.197-.151.284-.18.264-.059.005-.24-.039-.537-.126-.284-.079-.43-.123-.435-.133-.195.03-.342.108-.434.245-.025.005-.113.137-.274.395-.249.4-.708.63-1.377.689-.762.098-1.543.049-2.339-.141-.17-.03-.385-.054-.63-.084-.595-.069-.951-.151-1.074-.254-.102-.077-.44-.21-1.006-.395-.581-.201-.956-.366-1.133-.483-.23-.133-.488-.361-.776-.689-.469-.497-.737-.786-.806-.864-.093-.122-.17-.245-.244-.366-.072-.015-.151-.04-.234-.064-.557-.176-1.016-.537-1.367-1.088-.181-.323-.474-.636-.879-.933-.156-.102-.312-.215-.469-.343-.312-.018-.66-.121-1.03-.297-.508-.244-.781-.489-.826-.732-.072-.279.049-.641.376-1.084.298-.44.415-.815.347-1.119-.034-.17-.4-.385-1.089-.644-.693-.259-1.113-.527-1.259-.811-.01-.034.029-.113.116-.229.113-.112.205-.181.269-.2z',
											fill: '#ffecda',
										}),
										Object(Ot.jsx)('path', {
											d: 'M.781 12.856c.308-.239.645-.474 1.017-.703.253.425.619.576 1.092.464.255-.044.616-.186 1.09-.42.356-.069.805-.123 1.361-.146.484-.025.86-.084 1.124-.177.088-.025.171-.063.254-.122l.034-.009c.371-.079.835-.191 1.382-.337.528-.093.991-.108 1.401-.054.484.054.85.141 1.099.264.098.058.283.225.561.497.19.176.425.284.699.318.146.02.361.01.634-.029.269.015.542.082.831.21.41.19.83.43 1.254.723.357.214.88.341 1.572.371.015.005.45.072 1.309.205.748.136 1.163.185 1.245.151.103-.029.601-.249 1.495-.669.088-.025.521-.043 1.308-.064.791-.01 1.372-.073 1.743-.2.113-.03.592-.21 1.435-.547.518-.111.978-.146 1.373-.098.23.044.542.162.937.343.377.19.694.303.953.336.415.069.897.035 1.445-.097.176-.024.527-.127 1.055-.303.527-.166.912-.269 1.156-.307.738-.151 1.46-.186 2.164-.098.161.019.376.054.645.117.2.03.375.025.531-.019.235-.025.42-.084.568-.171.155-.078.385-.137.687-.181.455-.088.938-.053 1.441.098.449.141.82.366 1.118.669.044.033.366.176.971.42.538.253.831.517.88.791.044.165-.059.487-.304.956-.248.499-.336.904-.267 1.206.044.205.146.362.307.474.103.069.283.141.541.215.528.229.909.781 1.143 1.65.102.479.532.801 1.285.968.195.058.498.121.913.19.356.082.64.176.845.273.332.175.85.63 1.552 1.363.635.717 1.221 1.196 1.763 1.43.83.376 1.943.522 3.335.44.215 0 .473.116.776.346-.098-.01-.185-.01-.254-.005-.259.025-.615.113-1.079.274-.453.171-.781.254-.971.259-1.187.033-2.295-.177-3.326-.615.181.141.396.287.64.438.552.353.879.772.981 1.245.148.607-.156 1.06-.912 1.358-.582.25-1.148.381-1.709.386-.43-.03-1.236-.044-2.423-.049-1.191.019-1.996-.186-2.407-.614-.439-.421-.79-1.104-1.054-2.052-.289-.976-.474-1.503-.557-1.591-.152-.225-.498-.484-1.035-.781-.4-.215-.654-.558-.757-1.021-.025-.098.044-.347.215-.738.147-.4.205-.659.185-.786-.02-.068-.376-.469-1.073-1.205-.704-.684-1.109-1.08-1.217-1.183-.502-.307-1.055-.482-1.65-.527-.552-.005-.883-.049-.986-.131-.147-.103-.312-.362-.499-.782-.156-.356-.312-.576-.468-.663-.425-.21-.81-.338-1.158-.377-.287-.005-.736.064-1.347.2-.259.069-.498.172-.728.303-.269.166-.479.274-.635.312-.087.025-.287-.01-.6-.107-.322-.078-.707-.063-1.152.059-.43.141-.748.307-.943.503-.21.2-.425.337-.649.41l-.356.132c-.099 0-.191-.098-.274-.288-.043-.107-.01-.25.103-.42.131-.171.146-.322.039-.459-.318.024-.743.073-1.275.142-.629.097-1.089.195-1.372.297-.048.01-.435.249-1.162.704-.718.444-1.319.766-1.801.971-.23.093-.479.166-.753.22-.425.103-.689.073-.776-.084-.083-.131-.205-.425-.356-.873-.874.366-1.699.512-2.477.43-.897-.103-1.65-.538-2.25-1.299-.058-.093-.142-.259-.245-.508-.097-.225-.185-.396-.263-.508-.303-.372-.79-.703-1.464-.987-.509-.19-1.158-.385-1.959-.59-.605-.127-1.181-.191-1.724-.206-.595-.029-1.103.035-1.527.196-.699.259-1.411.42-2.149.488-1.127.122-1.826-.039-2.09-.483-.02-.035-.039-.078-.054-.132z',
											fill: '#ec7f6d',
										}),
										Object(Ot.jsx)('path', {
											d: 'M2.451 11.782c.01.117.034.215.083.297.03.069.112.108.25.133.16.063.287.082.37.044.025-.005.147-.084.366-.24.255-.127.425-.215.509-.264.302-.116.786-.146 1.445-.098.454.044.83.01 1.137-.107 0 .035-.015.059-.038.064.102.02.2.03.297.03-.054.023-.092.052-.122.082l.005.02-.034.009c-.083.059-.166.097-.254.122-.264.093-.635.152-1.124.177-.551.023-1.005.077-1.356.146-.479.234-.84.376-1.095.42-.472.112-.834-.039-1.092-.464.218-.117.438-.245.653-.371zm38.34 14.658l-.015-.068c-.023-.044-.038-.079-.048-.112-.064-.103-.318-.377-.762-.82-.43-.412-.678-.679-.737-.812-.079-.156-.21-.492-.396-1.006-.19-.405-.415-.639-.669-.697-.449-.064-.771-.128-.966-.191-.362-.147-.582-.391-.65-.742-.01-.035 0-.22.035-.552.038-.332.048-.562.028-.688-.053-.201-.2-.337-.435-.406-.292-.063-.531-.288-.717-.669-.088-.205-.185-.488-.283-.859-.078-.386-.142-.625-.191-.718-.097-.273-.292-.439-.581-.493-.151-.02-.419 0-.815.054-.313.039-.541.024-.694-.044-.18-.097-.259-.327-.239-.689-.761.274-1.318.41-1.665.41-.586.049-.883-.18-.883-.678-.177.102-.318.137-.425.092-.142-.034-.22-.107-.239-.224-.01.005.014-.073.082-.235.044-.146.079-.225.093-.238-.024-.103-.044-.195-.054-.274-.156.039-.312.082-.469.122-.072.034-.21.147-.41.347-.146.122-.297.205-.453.248-.177.069-.303.069-.382-.01-.063-.053-.131-.16-.21-.316-.151-.035-.307-.025-.463.014-.205.092-.362.151-.474.181-.029-.025-.024-.079.015-.146.029-.069.039-.133.025-.186-.084-.132-.21-.175-.376-.132-.098.049-.353.195-.768.439-.415.279-.736.455-.971.528-.146.063-.298.073-.439.03-.171-.05-.332-.054-.489-.015-.063.043-.156.102-.292.185-.079.058-.138.107-.176.142-.059.014-.093.024-.103.024-.097.039-.21.069-.337.092-.009 0-.029-.005-.058-.018-.054-.059-.117-.152-.201-.274-.098-.19-.249-.293-.459-.308-.274-.043-.722.049-1.342.288-.19.089-.489.264-.899.527-.39.284-.64.445-.751.474-.089.034-.215.034-.382-.005-.176-.029-.346-.019-.512.03-.064.039-.141.098-.24.17-.116.103-.21.171-.273.196-1.162.527-2.598.654-4.297.38-1.665-.223-3.1-.766-4.301-1.63-.997-.678-1.773-1.187-2.325-1.513-.967-.607-1.778-1.035-2.432-1.29-.141-.034-.43-.073-.873-.108-.777-.044-1.227-.077-1.338-.106-.977-.113-1.631-.309-1.974-.586.138-.215.308-.42.523-.607.04-.023.084-.053.122-.087.015.059.029.102.049.132.264.444.963.605 2.09.483.738-.068 1.455-.229 2.149-.488.425-.161.932-.225 1.527-.196.543.015 1.119.079 1.729.205.796.206 1.445.401 1.954.591.674.284 1.161.615 1.469.987.078.112.161.278.258.507.104.245.187.415.245.509.6.761 1.353 1.196 2.252 1.299.776.082 1.601-.064 2.475-.43.156.448.273.742.356.873.092.157.351.187.776.079.274-.049.523-.122.753-.215.483-.205 1.083-.527 1.806-.972.727-.459 1.114-.693 1.157-.703.284-.102.743-.2 1.373-.297.531-.074.956-.118 1.274-.147.107.142.097.293-.039.459-.108.175-.146.318-.103.425.088.19.175.288.274.283l.361-.132c.219-.068.434-.205.644-.406.196-.195.513-.366.943-.502.445-.123.83-.142 1.152-.059.313.097.513.132.601.107.157-.038.37-.146.634-.312.23-.131.474-.234.728-.303.611-.141 1.06-.205 1.347-.2.348.039.733.167 1.163.372.156.092.307.312.463.668.187.415.353.679.499.782.103.082.434.121.986.131.6.044 1.148.22 1.65.527.113.103.518.499 1.217 1.182.697.737 1.058 1.138 1.073 1.206.025.122-.033.381-.18.781-.171.391-.24.64-.215.738.103.463.357.806.757 1.021.537.297.883.561 1.04.781.083.088.263.615.552 1.591.264.948.615 1.632 1.054 2.057.411.423 1.216.628 2.407.61 1.187.005 1.993.023 2.423.053.541.142.894.21 1.059.2.068-.005.21-.028.43-.063.225-.059.371-.093.44-.098.195.005.468.074.825.19-1.04.318-1.842.464-2.398.445-.235.005-.655-.049-1.25-.166-.552-.103-.835-.151-.845-.151-1.304.015-2.251-.152-2.846-.494-.143-.098-.318-.214-.528-.361z',
											fill: '#ffc8c8',
										}),
										Object(Ot.jsx)('path', {
											d: 'M22.593 18.383c-.43.044-.772-.122-1.031-.497-.058-.079-.151-.123-.283-.123-.454.005-.83.18-1.133.538-.312.346-.679.61-1.099.781-.107.005-.195-.005-.258-.02-.298-.136-.595-.112-.894.079-.756.487-1.568.741-2.436.756-.723.039-1.455-.005-2.193-.127-.649-.103-1.284-.308-1.909-.625-.801-.395-1.636-.815-2.51-1.264-1.313-.645-2.577-1.421-3.808-2.339-1.679-.327-3.31-.699-4.893-1.114-.18-.312-.195-.6-.039-.868l.034-.01c.338.278.996.473 1.973.586.117.029.562.062 1.338.107.444.039.733.073.874.107.654.255 1.465.683 2.426 1.29.558.326 1.334.835 2.33 1.513 1.202.864 2.632 1.407 4.297 1.63 1.703.274 3.135.148 4.302-.38.063-.025.151-.093.268-.196.102-.072.181-.131.245-.17.166-.049.336-.059.512-.03.166.04.293.04.376.005.112-.029.367-.19.757-.474.405-.263.708-.438.898-.527.62-.239 1.064-.331 1.343-.288.21.015.361.118.459.308.083.122.146.21.2.274.005.018.02.028.045.018-.123.094-.202.23-.235.407-.074.175-.093.331-.054.463.02.088.054.152.097.19h.001z',
											fill: '#ecc8c8',
										}),
										Object(Ot.jsx)('path', {
											d: 'M23.878 18.145c.033-.407-.123-.636-.474-.699-.401-.059-.606-.098-.625-.118-.025.005-.04-.005-.044-.023.029.013.049.018.058.018.127-.023.24-.053.337-.092.01 0 .044-.01.103-.024.038-.035.097-.079.176-.137.136-.083.229-.147.292-.185.157-.044.323-.039.489.01.146.043.293.038.439-.03.235-.073.556-.249.976-.528.41-.244.665-.39.762-.439.167-.043.293 0 .377.131.014.059.003.118-.025.187-.039.072-.044.121-.015.146.112-.03.268-.088.473-.181.157-.039.313-.044.464-.014.079.156.146.264.21.321.084.074.21.074.382.005.156-.044.307-.126.453-.249.2-.195.338-.312.41-.341.157-.044.313-.089.469-.127.01.083.03.171.059.273-.019.015-.054.098-.098.239-.064.161-.092.24-.082.24.018.113.102.185.238.219.108.045.249.015.425-.093.005.504.298.728.884.679.346 0 .904-.136 1.665-.41-.02.361.059.596.239.689.153.069.386.082.699.049.391-.059.658-.079.81-.059.288.054.483.22.581.494.049.092.112.331.191.717.103.371.195.654.283.859.186.386.425.611.717.674.235.068.381.205.435.406.02.126.01.356-.029.687-.035.333-.045.518-.035.548.069.356.289.6.65.742.195.068.518.132.967.19.253.064.478.298.668.703.187.514.318.85.397 1.006.059.128.307.396.737.811.444.444.698.718.761.82.01.034.025.069.049.113-.141-.084-.287-.196-.435-.338-.6-.507-1.054-.81-1.356-.907-.309-.089-.581-.205-.811-.358-.23-.131-.337-.395-.323-.795.01-.371-.18-.596-.561-.673-.381-.045-.61-.084-.694-.123-.371-.127-.644-.479-.82-1.055-.292-.864-.449-1.327-.464-1.386-.512-.928-1.275-1.636-2.295-2.129-.937-.43-1.821-.566-2.641-.41-.279.078-.517.136-.722.18-.24.039-.792-.21-1.657-.742-.863-.503-1.727-.669-2.597-.508-.844.141-1.353.484-1.523 1.016l.001.001z',
											fill: '#eca391',
										}),
										Object(Ot.jsx)('path', {
											d: 'M41.05 27.807c.292-.126.4-.341.331-.649-.234-.294-.434-.537-.59-.719.21.148.385.269.528.362.595.342 1.542.508 2.846.493.01 0 .292.049.85.152.59.117 1.01.171 1.245.166.556.019 1.357-.128 2.397-.445.215-.054.444-.136.689-.239.17-.043.576.025 1.225.215.289.185.464.377.518.582.058.307-.01.561-.21.771-.264-.015-.498-.039-.703-.084-.156-.004-.304-.009-.435-.009-1.006-.015-1.977.059-2.9.224-.596.098-1.187.161-1.767.186-.328.029-.64-.005-.938-.092-.699-.138-1.382-.318-2.051-.543-.128-.029-.264-.064-.405-.107-.143-.039-.303-.088-.474-.162-.064-.043-.112-.077-.156-.102zm-17.173-9.663c-.258.024-.532.073-.821.152-.149.053-.305.082-.463.087-.044-.039-.078-.097-.103-.19-.034-.132-.019-.289.054-.464.039-.176.117-.312.235-.406.019.025.224.064.625.123.351.063.507.292.474.698h-.001z',
											fill: '#e29990',
										}),
										Object(Ot.jsx)('path', {
											d: 'M40.791 26.44c.156.181.356.424.59.718.069.308-.039.523-.331.649l-.015.005c-.024-.005-.093-.034-.2-.074-.097-.049-.239-.151-.425-.316-.18-.133-.385-.269-.615-.411-.239-.142-.42-.283-.547-.429-.152-.176-.337-.333-.557-.479-.694-.45-1.416-.879-2.157-1.289-.919-.473-1.593-1.167-2.018-2.085-.092-.225-.215-.463-.351-.713-.722-1.23-1.68-2.075-2.871-2.534-.274-.083-.552-.118-.835-.103-.337.083-.669.185-.992.323-.317.072-.556-.049-.727-.361-.102-.177-.215-.353-.336-.523-.425-.522-.953-.865-1.588-1.031-.566-.111-1.137 0-1.703.332-.088.074-.187.103-.284.093-.103.015-.219 0-.352-.049-.204-.005-.405-.01-.6-.019.171-.537.679-.875 1.523-1.016.87-.161 1.734.005 2.598.508.864.532 1.411.781 1.656.742.2-.044.444-.102.722-.18.82-.156 1.699-.02 2.642.41 1.02.493 1.782 1.201 2.294 2.129.016.059.172.517.464 1.386.177.576.449.928.82 1.055.084.039.313.078.694.123.381.077.566.302.561.673-.014.4.093.664.318.795.235.153.507.269.816.358.303.097.756.4 1.356.912.148.137.294.249.435.333l.015.067v.001z',
											fill: '#da6d5b',
										}),
										Object(Ot.jsx)('path', {
											d: 'M62.949 9.662c-.498.42-.997.835-1.499 1.246-.756-.23-1.333-.415-1.729-.562-.615-.239-1.137-.523-1.557-.84-.385-.288-.933-.449-1.635-.478-.23-.01-.538.005-.919.049-.405.024-.708.049-.917.068-.743.045-1.294-.014-1.66-.165-.528-.22-.874-.64-1.04-1.27-.01-.029-.162-.172-.455-.415-.347-.269-.703-.523-1.069-.772-1.104-.722-1.885-1.04-2.339-.957-.635.137-1.221.166-1.752.092-.343-.023-.758-.126-1.247-.292-.517-.176-.892-.269-1.137-.288-.415-.068-.849-.045-1.309.078-.356.097-.884.21-1.581.337-.694.136-1.206.249-1.544.341-.267.069-.688.22-1.264.444-.62.23-1.088.391-1.411.489-1.148.366-2.013.366-2.587-.01-.46-.273-.87-.605-1.242-.996-.18-.229-.428-.542-.756-.947-.264-.312-.527-.527-.801-.645-.323-.132-.733-.166-1.23-.102-.718.097-1.583.279-2.598.551-.205.044-1.065.269-2.589.674-.433.117-.825.151-1.176.102-.225-.033-.527-.116-.909-.243-.37-.127-.663-.21-.887-.244-.376-.054-.778-.025-1.201.087-.412.113-.875.343-1.378.694-.527.346-1.025.576-1.48.703-1.099.293-2.211.253-3.354-.108-.962-.331-1.7-.82-2.207-1.474 1.094-.391 2.207-.772 3.34-1.147.074-.03.645-.533 1.714-1.504.01-.01.03-.035.053-.064.034-.01.069-.02.103-.03.811-.107 1.255-.17 1.334-.195.253-.068.556-.258.907-.566.333-.279.615-.449.85-.512.679-.187 1.528-.192 2.544-.02 1.035.191 1.821.488 2.359.898.272.21.605.337 1 .377.25.028.616.018 1.108-.025.499-.064.86-.088 1.094-.078.396.01.743.121 1.04.331 1.168.777 2.564 1.348 4.195 1.714 1.845.415 3.72.489 5.625.215 1.269-.17 2.168-.277 2.695-.326.943-.015 1.865.082 2.769.282.41.084.864.118 1.376.098.279-.024.719-.098 1.309-.205.596-.103 1.055-.156 1.373-.171.175-.014.351-.019.512-.029.459.102.923.249 1.396.435.113.029.235.072.357.136.255.186.547.43.88.733.517.497 1.035 1.06 1.547 1.69.264.302.581.517.961.638.2.069.577.138 1.134.2.473.079.83.177 1.064.289.351.146.63.42.845.815.707.04 1.739.2 3.095.484.527.107 1.157.239 1.88.39z',
											fill: '#da5b5b',
										}),
										Object(Ot.jsx)('path', {
											d: 'M49.79 3.847c-.166.01-.337.02-.513.03-.322.014-.781.072-1.377.17-.59.112-1.03.181-1.309.21-.512.015-.966-.019-1.371-.103-.904-.2-1.831-.292-2.774-.277-.522.044-1.421.151-2.695.326-1.905.269-3.78.197-5.625-.218-1.631-.367-3.027-.938-4.195-1.715-.297-.21-.644-.317-1.04-.332-.229-.01-.595.015-1.094.078-.492.049-.858.058-1.107.03-.391-.04-.728-.166-.996-.381-.543-.405-1.329-.703-2.364-.894C22.315.6 21.47.605 20.786.786c-.235.064-.517.234-.85.517-.346.308-.648.498-.907.567-.079.02-.523.083-1.334.195-.034.005-.064.015-.097.025.957-.879 1.592-1.363 1.895-1.44 2.402-.645 4.423-.812 6.063-.494.645.127 1.334.351 2.067.669.023.015.717.332 2.07.952 1.918.874 3.842 1.465 5.771 1.778 2.91.453 6.534.443 10.86-.02 1.064-.113 2.216-.01 3.466.312zm1.748.576c1.513.552 3.213 1.353 5.102 2.403 2.051 1.142 4.541 1.762 7.466 1.86-.385.347-.771.668-1.157.976-.728-.151-1.353-.282-1.884-.395-1.357-.282-2.389-.444-3.091-.479-.215-.4-.499-.673-.85-.815-.234-.117-.59-.215-1.064-.288-.557-.068-.932-.137-1.134-.2-.38-.127-.697-.342-.961-.639-.512-.63-1.03-1.193-1.542-1.69-.338-.308-.63-.551-.885-.733z',
											fill: '#ffc8c8',
										}),
										Object(Ot.jsx)('path', {
											d: 'M61.45 10.908c-.257.237-.527.459-.81.664-.445-.284-.83-.512-1.153-.679-1.508-.855-2.637-1.127-3.383-.835-.825.318-1.558.435-2.203.357-.489-.074-1.025-.269-1.616-.592-.83-.473-1.328-.736-1.489-.805-.645-.258-1.309-.361-1.987-.312.146-.709-.074-1.27-.65-1.69-.488-.351-1.157-.546-2.011-.595-.362-.01-.762-.059-1.207-.146-.502-.103-.873-.177-1.103-.225-.898-.152-1.675-.142-2.324.028-.123.035-.948.313-2.476.825-1.499.514-2.319.787-2.455.822-.817.218-1.558.175-2.223-.123-.439-.205-.951-.615-1.532-1.225-.64-.655-1.114-1.07-1.412-1.255-.571-.338-1.201-.415-1.895-.23-.121.034-.41.195-.858.484-.46.263-.817.433-1.07.502-.605.161-1.558.156-2.857-.01-.663-.097-1.117-.156-1.376-.17-.42-.054-.709-.059-.865-.02-.19.054-.727.303-1.611.756-.894.479-1.363.758-1.411.845.253.138.458.284.62.445.166.113.268.19.317.239.064.054.128.079.2.069.074.005.225-.025.459-.089.122-.029.465-.175 1.016-.434.566-.258.909-.405 1.03-.435.953-.258 1.803-.351 2.549-.287.596.044 1.221.2 1.865.469.396.17.977.443 1.749.825.737.341 1.435.576 2.095.712 1.493.343 3.153.464 4.98.356 1.07-.072 2.753-.248 5.048-.527 2.017-.17 3.784.152 5.308.967.606.328 1.216.772 1.846 1.319.318.249.854.733 1.606 1.44.64.605 1.163 1.064 1.573 1.373.6.463 1.181.8 1.742 1.025 1.173.438 2.5.488 3.98.156-.122.4-.263.751-.42 1.045l-.302.077c-1.319.005-2.72-.375-4.209-1.152-.581-.287-1.246-.674-1.997-1.151-.118-.079-.772-.518-1.973-1.324-1.67-1.109-3.027-1.88-4.067-2.319-1.622-.635-3.213-.86-4.78-.678-1.998.267-3.629.418-4.884.468-2.188.098-3.804-.025-4.844-.371-.195-.069-.474-.225-.825-.479l-.922-.688c-.83-.592-1.432-.889-1.802-.884-1.265.02-2.568.225-3.911.62-.371.122-.757.254-1.147.396l-.44.17c-.63-.01-1.319-.024-2.075-.034-1.509-.038-2.588-.19-3.248-.445-1.117-.418-2.5-1.278-4.155-2.582-.039-.136-.069-.249-.092-.336.258-.118.566-.24.922-.372.069-.02.138-.04.205-.053.508.648 1.245 1.142 2.208 1.468 1.137.367 2.255.402 3.35.108.458-.121.951-.356 1.483-.698.503-.351.963-.586 1.378-.693.424-.113.825-.142 1.196-.088.224.034.523.118.893.244.381.127.683.205.908.244.347.048.743.015 1.177-.103 1.518-.405 2.383-.63 2.583-.674 1.02-.272 1.885-.458 2.603-.551.497-.064.907-.03 1.23.103.269.117.537.332.801.645.323.405.576.717.756.946.367.391.782.724 1.237.996.58.371 1.44.376 2.587.01.323-.097.791-.264 1.416-.489.577-.223.997-.375 1.264-.443.333-.093.85-.205 1.544-.342.694-.127 1.22-.24 1.577-.337.459-.123.898-.146 1.308-.078.245.019.625.112 1.139.288.487.166.902.264 1.25.292.531.074 1.117.045 1.752-.092.454-.088 1.235.235 2.339.952.366.249.722.508 1.069.777.293.243.445.381.45.415.171.625.517 1.05 1.04 1.27.366.151.917.205 1.665.161.21-.02.512-.04.912-.064.386-.044.689-.059.924-.049.702.029 1.245.185 1.635.478.42.317.937.601 1.552.84.402.147.978.332 1.734.562z',
											fill: '#ffecda',
										}),
										Object(Ot.jsx)('path', {
											d: 'M60.64 11.572c-.932.766-1.89 1.532-2.866 2.295-.093.376-.2.717-.318 1.04-1.48.336-2.802.283-3.975-.156-.561-.22-1.147-.561-1.747-1.027-.407-.307-.933-.766-1.573-1.371-.752-.709-1.289-1.191-1.606-1.441-.625-.546-1.24-.986-1.846-1.317-1.519-.812-3.292-1.133-5.303-.968-2.295.279-3.98.455-5.049.528-1.831.107-3.491-.014-4.98-.357-.66-.131-1.357-.371-2.095-.712-.776-.381-1.357-.655-1.748-.825-.649-.269-1.274-.425-1.87-.469-.747-.064-1.597.034-2.544.288-.123.03-.469.181-1.035.44-.551.253-.889.4-1.011.433-.239.064-.39.094-.464.084-.068.01-.136-.015-.2-.069-.044-.048-.151-.127-.313-.238-.161-.162-.371-.308-.625-.445.054-.083.523-.367 1.412-.845.883-.454 1.421-.703 1.611-.757.156-.038.445-.033.869.02.255.019.713.073 1.372.17 1.304.167 2.256.172 2.856.01.259-.068.615-.238 1.07-.502.449-.289.738-.45.859-.484.694-.185 1.324-.107 1.895.23.298.185.771.605 1.416 1.254.58.611 1.089 1.021 1.528 1.226.669.303 1.411.341 2.227.123.132-.035.952-.308 2.455-.822 1.524-.512 2.349-.79 2.472-.82.648-.176 1.426-.185 2.328-.033.23.048.597.121 1.104.228.44.084.845.133 1.206.143.85.049 1.519.249 2.007.595.581.42.796.981.655 1.695.678-.054 1.342.054 1.982.307.161.068.659.336 1.494.805.586.323 1.122.523 1.611.596.645.078 1.378-.043 2.208-.361.746-.293 1.875-.015 3.383.835.318.161.703.39 1.148.674z',
											fill: '#ec7f6d',
										}),
										Object(Ot.jsx)('path', {
											d: 'M11.363 5.235c.023.087.053.199.092.336 1.655 1.303 3.043 2.167 4.16 2.582.655.259 1.734.406 3.243.445.756.01 1.45.024 2.075.034l.44-.17c.39-.143.776-.274 1.152-.396 1.343-.395 2.641-.6 3.91-.62.366 0 .968.292 1.797.883l.923.689c.351.254.63.41.83.479 1.035.346 2.651.469 4.839.375 1.255-.054 2.886-.205 4.889-.469 1.566-.18 3.158.045 4.779.679 1.04.44 2.393 1.216 4.068 2.32 1.196.805 1.855 1.245 1.972 1.322.752.484 1.417.87 1.997 1.153 1.49.776 2.891 1.162 4.205 1.158l.302-.083c-.498 1.005-1.07 1.474-1.728 1.396-1.02-.097-2.203-.448-3.55-1.06-1.377-.576-2.764-1.357-4.165-2.333-.792-.543-1.382-.953-1.768-1.23-.649-.464-1.225-.83-1.734-1.104-1.332-.791-2.553-1.226-3.651-1.299-.821-.069-2.056-.059-3.711.024-1.998.094-3.36.132-4.078.122-1.518-.025-2.763-.19-3.745-.488-.947-.283-1.718-.723-2.31-1.318-.282-.084-.551-.117-.8-.112-.406.063-.85.166-1.338.307-.259.069-.703.225-1.333.464-1.196.454-2.162.694-2.91.727-1.211.083-3.066-.336-5.561-1.26-.64-.224-1.695-.63-3.165-1.215-1.489-.86-1.528-1.636-.126-2.339v.001z',
											fill: '#e29990',
										}),
										Object(Ot.jsx)('path', {
											d: 'M51.187 27.996c6.667.586 9.697 1.728 9.09 3.424-.405 1.133-1.749 2.062-4.03 2.79-.385.119-1.332 1.453-2.847 3.998-1.515 2.586-3.081 4.151-4.699 4.699-2.927 1.009-6.262 1.432-9.999 1.272-3.554-.142-6.382-.737-8.484-1.787-1.335-.648-2.163-1.427-2.485-2.335-.281-.829-1.08-1.495-2.394-2.001-.829-.301-2.533-.473-5.119-.514-3.315.02-5.851.03-7.608.03-6.806-.021-10.706-.758-11.695-2.211-.991-1.435-.334-3.163 1.968-5.181 1.192-.971 2.001-1.657 2.426-2.063.708-.687.959-1.202.758-1.545-.526-.908-.142-2.11 1.151-3.606 1.373-1.575 2.93-2.353 4.667-2.333 1.938.021 3.474-.23 4.604-.757 1.252-.586 2.889-.92 4.91-1 5.737-.243 10.031-.05 12.878.577 1.192.242 3.465 1.089 6.817 2.544 1.03.444 1.799 1.019 2.302 1.726.285.405.607.991.971 1.758.849 1.355 3.122 2.192 6.818 2.515z',
											fill: '#afaa8e',
										}),
										Object(Ot.jsx)('path', {
											d: 'M51.187 27.3c6.667.586 9.697 1.726 9.09 3.424-.405 1.13-1.749 2.06-4.03 2.787-.385.122-1.332 1.456-2.847 4.001-1.515 2.587-3.081 4.152-4.699 4.696-2.927 1.009-6.261 1.435-9.999 1.273-3.554-.142-6.382-.737-8.484-1.788-1.334-.644-2.159-1.423-2.485-2.331-.281-.829-1.08-1.497-2.394-2.003-.829-.303-2.533-.474-5.119-.515-3.315.02-5.851.032-7.608.032-6.806-.02-10.706-.757-11.695-2.213-.991-1.436-.334-3.161 1.968-5.182 1.192-.97 2.001-1.657 2.426-2.06.708-.686.959-1.201.758-1.544-.526-.912-.142-2.113 1.151-3.607 1.373-1.577 2.93-2.353 4.667-2.335 1.938.021 3.474-.231 4.604-.757 1.252-.604 2.889-.947 4.91-1.03 5.758-.222 10.048-.03 12.878.577 1.251.264 3.524 1.121 6.817 2.574 1.03.444 1.8 1.021 2.303 1.729.284.384.606.97.97 1.757.87 1.352 3.142 2.192 6.818 2.515z',
											fill: '#fff8ed',
										}),
										Object(Ot.jsx)('path', {
											d: 'M50.58 40.451c1.029-1.051 2.172-2.658 3.424-4.818.991-1.698 1.719-2.607 2.183-2.728 1.231-.302 2.018-.545 2.362-.728.929-.503 1.477-1.302 1.636-2.394.423.69.03 1.465-1.181 2.335-.869.606-1.787 1.071-2.757 1.393-.385.122-1.335 1.456-2.85 4.001-1.515 2.587-3.081 4.152-4.696 4.696-2.93 1.009-6.261 1.435-9.999 1.273-3.554-.142-6.382-.737-8.484-1.788-1.334-.644-2.162-1.423-2.485-2.331-.284-.829-1.08-1.497-2.394-2.003-.829-.303-2.536-.474-5.119-.515-3.315.02-5.851.032-7.608.032-6.806-.02-10.706-.757-11.695-2.213-.908-1.332-.464-2.868 1.332-4.608 2.16-1.681 3.418-2.831 3.773-3.453l-.408.757c-.021.021-.799.72-2.332 2.093-1.134 1.009-1.657 2-1.577 2.968.062.79.778 1.527 2.15 2.213 1.8.888 4.203 1.261 7.212 1.121 2.527-.121 6.132-.304 10.818-.547 3.555.041 5.646.669 6.274 1.882.443.867.796 1.805 1.059 2.817.506.746 2.031 1.503 4.575 2.273 1.879.565 4.637.766 8.274.604 4.323-.182 7.161-.959 8.513-2.332z',
											fill: '#d0cdc4',
										}),
										Object(Ot.jsx)('path', {
											d: 'M25.765 20.876c.666.909.787 1.93.364 3.06-.485 1.251-1.465 2.213-2.941 2.879-1.696.746-3.637.85-5.818.302-2.261-.565-3.412-1.586-3.453-3.06-.021-.526.121-.97.423-1.335.284-.343.565-.443.849-.301.181.101 1.101-.444 2.758-1.636 1.757-1.273 3.232-1.818 4.424-1.637 1.554.222 2.687.799 3.394 1.728z',
											fill: '#e1cdb7',
										}),
										Object(Ot.jsx)('path', {
											d: 'M23.794 19.42c1.272.79 1.95 1.779 2.03 2.971.101 1.193-.423 2.243-1.574 3.152-1.151.908-2.587 1.414-4.302 1.515-1.72.1-3.215-.243-4.486-1.03-1.253-.79-1.93-1.778-2.031-2.971-.079-1.193.444-2.243 1.575-3.151 1.154-.909 2.586-1.415 4.305-1.515 1.716-.08 3.211.263 4.483 1.029z',
											fill: '#f1b42c',
										}),
										Object(Ot.jsx)('path', {
											d: 'M25.158 21.24c.163.343.252.687.273 1.03.1 1.071-.394 2.018-1.486 2.846-1.089.829-2.444 1.285-4.059 1.365-1.394.062-2.658-.181-3.788-.728-1.11-.524-1.838-1.222-2.181-2.09 1.574 1.214 3.888 1.587 6.939 1.122 1.251-.183 2.302-.737 3.151-1.666.586-.627.968-1.255 1.151-1.879z',
											fill: '#f9dc68',
										}),
										Object(Ot.jsx)('path', {
											d: 'M18.433 18.876c.544.142.464.364-.244.666-.748.322-1.133.355-1.15.091-.021-.222.15-.414.514-.577.344-.159.636-.222.88-.18zm-1.942.938c.202.062.222.171.062.334-.141.163-.284.234-.426.213-.201-.041-.243-.151-.122-.334.122-.201.285-.273.486-.213z',
											fill: '#fff',
										}),
										Object(Ot.jsx)('path', {
											d: 'M42.398 27.359c1.737.264 2.991.959 3.758 2.093.748 1.089.879 2.334.394 3.725-.545 1.536-1.646 2.707-3.303 3.516-1.899.929-4.072 1.062-6.516.393-2.545-.686-3.826-1.917-3.846-3.696-.021-.645.141-1.192.485-1.636.322-.423.645-.556.971-.393.2.121 1.231-.545 3.089-2.001 1.959-1.536 3.616-2.201 4.968-2.001z',
											fill: '#e1cdb7',
										}),
										Object(Ot.jsx)('path', {
											d: 'M46.461 31.361c.1 1.473-.506 2.778-1.82 3.908-1.314 1.131-2.95 1.758-4.909 1.879-1.959.121-3.654-.292-5.09-1.242-1.435-.971-2.201-2.193-2.302-3.667-.082-1.476.524-2.778 1.817-3.909 1.314-1.131 2.95-1.758 4.909-1.879 1.938-.121 3.625.293 5.061 1.243 1.455.97 2.23 2.192 2.334 3.667z',
											fill: '#f1b42c',
										}),
										Object(Ot.jsx)('path', {
											d: 'M46.064 31.239c.083 1.373-.482 2.595-1.695 3.666-1.231 1.051-2.746 1.628-4.545 1.729-1.577.1-2.989-.184-4.244-.85-1.231-.687-2.038-1.586-2.423-2.696 1.737 1.536 4.323 2.001 7.758 1.394 1.394-.243 2.575-.95 3.546-2.122.665-.828 1.091-1.636 1.272-2.423.201.465.314.896.331 1.302z',
											fill: '#f9dc68',
										}),
										Object(Ot.jsx)('path', {
											d: 'M38.036 27.058c.607.163.504.435-.305.816-.825.406-1.26.444-1.302.122-.02-.261.184-.503.607-.725.385-.204.716-.275 1-.213zm-2.213 1.181c.222.062.255.191.092.393-.181.204-.343.293-.486.275-.222-.041-.272-.183-.15-.426.141-.242.322-.323.544-.242zm-27.15 1.363c.122-.1.222-.1.305 0 .08.101.05.214-.092.335-.141.16-.263.19-.363.089-.122-.101-.072-.243.15-.424zm-.423.456c.121 0 .142.08.059.243-.08.16-.151.201-.21.121-.042-.083-.042-.162 0-.242.039-.083.089-.122.151-.122zm1.879 1c.181-.163.322-.163.423 0 .101.14.062.303-.121.483-.202.204-.382.234-.545.091-.163-.121-.079-.313.243-.574zm-.606.666c.18 0 .222.113.121.332-.121.242-.231.304-.334.183-.081-.1-.09-.213-.03-.335.062-.121.142-.18.243-.18zm21.574-11.818c.121-.101.222-.101.302 0 .062.1.033.213-.088.334-.143.142-.264.16-.368.059-.118-.079-.068-.21.154-.393zm-.423.455c.118 0 .151.081.089.243-.08.159-.151.201-.21.122-.062-.084-.071-.163-.033-.244.041-.082.092-.121.154-.121zm2.24 2.726c.083-.059.142-.059.184 0 .038.041.02.103-.063.183-.08.08-.15.101-.209.059-.062-.059-.033-.139.088-.242zm-.243.242c.083.021.101.071.062.151-.062.083-.112.104-.151.062-.02-.041-.02-.092 0-.151.019-.041.051-.062.089-.062zm20.273 4.214c.101-.083.172-.083.213 0 .042.08.021.16-.062.243-.08.079-.162.088-.243.029-.1-.062-.071-.15.092-.272zm-.272.302c.08.02.089.079.03.183-.062.101-.113.13-.151.089-.021-.059-.021-.121 0-.18.041-.063.079-.092.121-.092zm2.181 1.243c.101-.08.171-.08.213 0 .059.079.039.171-.062.272-.101.121-.202.142-.302.062-.1-.083-.05-.192.151-.334zm-.364.364c.1 0 .121.071.062.212-.083.119-.142.152-.184.09-.038-.06-.038-.122 0-.181.042-.08.081-.121.122-.121zm-1.637.453c.063-.06.113-.06.151 0 .042.04.021.103-.059.183-.062.079-.121.092-.183.029-.059-.041-.03-.109.091-.212zm-.242.242c.083 0 .101.042.062.121-.042.084-.08.104-.121.062-.021-.041-.021-.079 0-.121 0-.042.02-.062.059-.062zm-10.484 9.668c.101-.084.183-.084.242 0 .042.079.021.171-.062.272-.118.1-.219.121-.301.062-.081-.083-.039-.193.121-.334zm-.332.363c.101 0 .122.059.06.181-.06.121-.113.151-.152.092-.041-.062-.05-.122-.029-.181.038-.062.08-.092.121-.092z',
											fill: '#fff',
										}),
										Object(Ot.jsx)('path', {
											d: 'M10.221 23.421c.604.121.725.284.361.485-.382.181-.758.243-1.119.181-.284-.059-.305-.202-.062-.424.263-.221.536-.301.82-.242zm.997 1.03c.607.062.698.213.275.455-.426.243-.758.332-1 .272-.183-.059-.192-.2-.033-.422.184-.225.435-.326.758-.305zm10.366 5.666c1.532.305 1.959.657 1.272 1.062-.728.444-1.414.453-2.062.03-.503-.325-.616-.618-.332-.879.281-.242.655-.313 1.122-.213zm1.151 1.699c.465.201.636.382.515.544-.101.14-.365.181-.79.122-.362-.042-.465-.184-.302-.426.162-.261.352-.344.577-.24zm9.211 4.332c.625.202.968.506 1.03.908.059.406-.334.486-1.184.243-.807-.221-1.079-.494-.816-.817.263-.325.586-.435.97-.334zm-2.426-9.031c1.033.242 1.435.526 1.213.849-.222.302-.808.394-1.757.273-.829-.101-1.072-.344-.728-.728.343-.382.769-.515 1.272-.394zm1.85-1.24c.343.201.435.403.272.604-.142.183-.394.212-.758.091-.323-.121-.385-.301-.18-.544.201-.222.423-.272.666-.151zm17.544 5.785c-.627-.059-.87-.301-.728-.725.142-.464.405-.657.787-.577 1.214.243 1.708.545 1.486.909-.222.343-.737.476-1.545.393zm.817.242c.284.101.375.255.275.456-.083.184-.293.235-.637.151-.304-.079-.375-.222-.213-.422.181-.185.373-.244.575-.185zm-1.634 7.002c.586.059.737.314.453.758-.302.444-.707.514-1.21.21-.467-.281-.518-.524-.154-.725.284-.184.586-.264.911-.243zm-1.213 1.243c.323.121.385.272.183.453-.204.183-.416.212-.638.091-.202-.121-.211-.254-.03-.394.162-.162.322-.212.485-.15z',
											fill: '#e5d7b4',
										}),
									],
								}),
							},
						),
					);
				});
			(sc.displayName = 'BaconandEggsIcon'), (sc.muiName = 'SvgIcon');
			var ac = sc,
				lc = Object(oc.a)(function (e) {
					return Object(Ot.jsx)(
						cc.a,
						Object(m.a)(
							Object(m.a)({}, e),
							{},
							{
								children: Object(Ot.jsxs)('svg', {
									viewBox: '0 0 427 495',
									xmlns: 'http://www.w3.org/2000/svg',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.414',
									children: [
										Object(Ot.jsx)('path', {
											d: 'M8.26 399.72c0 48.162 92.167 87.201 205.44 87.201 113.28 0 205.11-39.039 205.11-87.201V227.31H8.26v172.41z',
											fill: 'url(#_Radial1)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M4.741 217.33c0 5.598-11.26 34.952 3.647 34.952 9.034 0 5.387-11.854 13.25-2.996 27.498 30.954 35.435 85.56 64.271 112.5 13.741 12.84 32.331 8.335 48.197 15.977 23.843 11.475 16.089 48.591 47.394 48.591 27.33 0 18.203-51.088 45.034-51.088 28.29 0 30.412 34.449 49.2 34.449 24.347 0 12.977-56.833 37.269-79.881 35.774-33.949 63.386-10.738 58.136 9.486-5.96 22.965 1.903 42.436 12.922 42.436 17.392 0 13.327-34.171 12.423-43.435-2.484-25.462 9.423-42.924 18.886-50.425 14.506-11.498 10.929-56.36 10.929-70.145 0-46.735-70.769-92.947-213.88-92.947-148.42-.01-207.68 45.78-207.68 92.52l.002.006z',
											fill: 'url(#_Radial2)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M4.075 209.34c0 5.597-11.257 34.951 3.65 34.951 9.03 0 5.387-11.854 13.254-2.995 27.498 30.953 35.427 85.56 64.267 112.5 13.737 12.841 32.331 8.336 48.193 15.977 23.847 11.475 16.405 49.925 47.706 49.925 27.33 0 17.891-52.421 44.722-52.421 28.29 0 30.412 34.448 49.204 34.448 24.347 0 12.973-56.833 37.269-79.881 35.771-33.949 63.382-10.737 58.132 9.486-5.956 22.966 1.907 42.437 12.922 42.437 17.392 0 13.332-34.172 12.423-43.436-2.484-25.462 9.419-42.924 18.89-50.424 14.502-11.499 10.925-56.361 10.925-70.146 0-46.735-70.765-92.947-213.88-92.947-148.4-.01-207.66 45.78-207.66 92.52l-.017.006z',
											fill: 'url(#_Radial3)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M331.9 158.08c0 22.794-53.946 41.274-120.49 41.274-66.545 0-120.49-18.48-120.49-41.274 0-22.79 53.947-41.27 120.49-41.27 66.54 0 120.49 18.48 120.49 41.27z',
											fill: 'url(#_Radial4)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M295.66 97.503s7.321-27.623-11.65-33.278c-18.972-5.663-93.192-7.656-98.852 0-5.66 7.653 110.5 33.278 110.5 33.278h.002z',
											fill: 'url(#_Radial5)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M185.49 46.58s-80.239 19.51-90.197 65.238c-10.652 48.927 24.295 64.567 129.81 81.877 37.58 6.16-39.61-147.12-39.61-147.12l-.003.005z',
											fill: 'url(#_Radial6)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M184.83 55.239s-61.24 9.649-62.906 48.927c-1.666 39.269 37.276 70.223 58.245 76.214 20.968 5.991 27.955-9.985 25.294-34.948-2.65-24.96-20.62-90.191-20.62-90.191l-.013-.002z',
											fill: 'url(#_Radial7)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M179.84 53.242s-51.922 11.646-51.922 46.259c0 34.62 33.614 42.272 47.261 44.933 13.647 2.668 56.583 24.635 56.583 35.283s.332 13.316.332 13.316 29.292-25.633 36.613-26.296c7.33-.66-88.86-113.49-88.86-113.49l-.007-.005z',
											fill: 'url(#_Radial8)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M246.53 26.727c13.117 15.231 16.924 33.044 9.618 46.005-10.028 17.782-44.168 31.277-72.337 16.932-21.203-10.785-22.888-40.86-12.548-58.463 12.115-20.621 35.802-36.738 53.314-29.397 12.32 5.136 13.35 14.922 21.96 24.923h-.007z',
											fill: 'url(#_Radial9)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M238.64 16.391s-9.412-11.253-15.103-8.932c-4.517 1.833 4.642 12.282 6.985 16.444 2.345 4.169 18.539 25.068 23.621 22.946 5.08-2.126-9.73-20.832-15.5-30.458h-.003z',
											fill: 'url(#_Radial10)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M248.36 36.715c-1.607 5.188-6.826-1.739-10.192-4.435-5.753-4.638-8.218-11.639-6.81-13.402 1.673-2.106 4.688-1.58 9.295 3.741 5.42 6.245 8.84 10.462 7.7 14.096h.007z',
											fill: 'url(#_Radial11)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M183.81 89.664c28.169 14.346 62.309.851 72.337-16.932 1.618-2.875 2.605-6.011 3.147-9.279-1.42-3.639-2.972-7.126-4.419-9.302-4.81-7.146-8.765-9.154-8.765-9.154s5.52 14.95-9.317 19.058c-13.784 3.818-52.82 18.566-71.557-5.305.88 12.64 6.63 24.841 18.57 30.914h.004z',
											fill: 'url(#_Radial12)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M182.23 27.105c7.216-7.239 29.378-19.76 32.007-23.878 1.104-1.732 4.458-2.215 8.008-2.208-17.232-5.086-39.402 10.445-50.986 30.181-3.783 6.456-5.94 14.588-6.127 22.822 1.78-3.464 10.63-20.431 17.1-26.917h-.002z',
											fill: 'url(#_Radial13)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M201.72 24.141s4.825-6.482 13.426-1.361c8.601 5.118 14.291 11.982 14.942 16.042.663 4.049-8.156.8-13.675-3.491-5.53-4.294-16.32-7.06-14.7-11.19h.007z',
											fill: 'url(#_Radial14)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M209.38 23.322s7.328 1.751 9.298 4.24c1.946 2.469 5.789 6.167 4.688 7.333-1.1 1.186-7.41-4.505-8-4.801-.6-.309-14.67-3.504-5.99-6.772h.004z',
											fill: 'url(#_Radial15)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M175.51 63.554s-16.308 16.312-16.308 40.607c0 24.295 21.304 34.281 36.613 34.281 15.31 0 36.941 4.329 47.593 14.314 10.652 9.985 16.636 16.975 32.615 19.303 15.98 2.328 36.286 3.662 37.616-4.989 1.33-8.65-138.13-103.51-138.13-103.51l.001-.006z',
											fill: 'url(#_Radial16)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M271.7 132.46c21.102 13 48.104 10.344 57.582 12.649 0 0 15.309-21.639 6.989-34.62-8.319-12.98-27.295-20.964-40.938-22.294-13.644-1.334-43.603-11.651-57.913-16.975-14.311-5.328-32.615 2.325-35.279 9.314-2.664 6.99-5.324 15.976-5.324 15.976s41.93 15.639 74.88 35.949l.003.001z',
											fill: 'url(#_Radial17)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M177.18 67.221s-7.653 19.97 14.646 27.958c22.298 7.988 57.25 16.304 71.892 33.278 14.643 16.975 43.604 49.925 51.923 41.274 8.319-8.651 28.621-27.288 13.644-32.951-14.978-5.656-51.923-1.662-63.904-13.979-11.982-12.318-22.638-16.312-41.274-21.967-18.65-5.651-33.62-8.647-46.93-33.609l.003-.004z',
											fill: 'url(#_Radial18)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M216.32 448.31c95.486 0 176.26-22.213 203.01-52.776-.012 4.481-.02 8.577-.02 12.174 0 48.162-92.097 87.201-205.69 87.201-113.6 0-205.7-39.039-205.7-87.201 0-6.771-.008-13.297-.016-19.76 19.191 34.42 105.2 60.37 208.42 60.37l-.004-.008z',
											fill: 'url(#_Radial19)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M373.38 160.06c19.214 10.239 30.412 22.432 30.412 35.537 0 36.16-84.939 65.472-189.72 65.472-100.77 0-183.16-27.123-189.3-61.369-.246 1.428-.41 2.863-.41 4.314 0 38.603 87.923 69.896 196.37 69.896s196.37-31.293 196.37-69.896c0-16.65-16.39-31.94-43.72-43.95l-.002-.004z',
											fill: 'url(#_Radial20)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M313.26 304.86s69.896-47.928 73.89 26.96c-9.99-15.97-7.99-42.93-73.89-26.96z',
											fill: 'url(#_Radial21)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M392.14 338.81s-.5 21.468-6.99 30.954c14.98.01 6.99-30.95 6.99-30.95v-.004z',
											fill: 'url(#_Radial22)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M338.1 152.22c.09 1.311.137 2.625.137 3.947 0 40.923-49.211 89.71-103.86 90.786 37.943 6.989 158.94-15.976 158.94-54.34 0-17.63-22.45-32.89-55.22-40.4l.003.007z',
											fill: 'url(#_Radial23)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M304.77 324.09s-17.474 22.217-17.474 47.679c0 25.462-11.482 29.456-18.972 18.972 11.65-.336 12.649-10.149 12.649-20.634 0-10.485.83-34.88 23.79-46.02l.007.003z',
											fill: 'url(#_Radial24)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M226.72 362.12s-17.31.663-23.964 18.301c-6.654 17.645-17.642 48.264-35.946 26.632 14.646 4.321 19.643-5.001 27.295-20.306 7.66-15.31 13.32-25.96 32.62-24.62l-.005-.007z',
											fill: 'url(#_Radial25)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsx)('path', {
											d: 'M368.18 262.93s38.942-17.974 50.924-36.945c0 20.969 3.994 33.949-5.991 45.932-9.984 11.981-17.973 22.966-19.97 31.952-5.99-21.96-7.99-37.94-24.96-40.93l-.003-.009z',
											fill: 'url(#_Radial26)',
											fillRule: 'nonzero',
										}),
										Object(Ot.jsxs)('defs', {
											children: [
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial1',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(680.844 0 0 673.97 385.872 166.08)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.02', stopColor: '#fdf7e2' }),
														Object(Ot.jsx)('stop', { offset: '.09', stopColor: '#f8e18c' }),
														Object(Ot.jsx)('stop', { offset: '.13', stopColor: '#f6d86a' }),
														Object(Ot.jsx)('stop', { offset: '.37', stopColor: '#f3cb5a' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#c47313' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial2',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-330.499 0 0 332.06 400.561 -112.46)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial3',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-476.271 0 0 478.52 374.087 -25.642)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial4',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(389.15 -49.608) scale(273.26)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial5',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-801.74 0 0 801.74 119 63.557)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial6',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-571.77 0 0 571.77 165.5 -1.679)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial7',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-776.58 0 0 776.58 324 -84.213)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial8',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-916.37 0 0 916.37 115 32.94)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial9',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(112.065 57.04 -57.3779 111.414 300.006 47.878)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.05', stopColor: '#fccdcc' }),
														Object(Ot.jsx)('stop', { offset: '.17', stopColor: '#f65954' }),
														Object(Ot.jsx)('stop', { offset: '.22', stopColor: '#f32b24' }),
														Object(Ot.jsx)('stop', { offset: '.52', stopColor: '#db2313' }),
														Object(Ot.jsx)('stop', { offset: '.77', stopColor: '#c8140d' }),
														Object(Ot.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#aa0e0b' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial10',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(199.688 101.639 -102.242 198.528 261.591 15.9)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.29' }),
														Object(Ot.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.29' }),
														Object(Ot.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.29' }),
														Object(Ot.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.29' }),
														Object(Ot.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.29' }),
														Object(Ot.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.29' }),
														Object(Ot.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.29' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.29' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial11',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(45.458 23.1377 -23.2748 45.1939 273.83 23.118)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.05', stopColor: '#fccdcc' }),
														Object(Ot.jsx)('stop', { offset: '.17', stopColor: '#f65954' }),
														Object(Ot.jsx)('stop', { offset: '.22', stopColor: '#f32b24' }),
														Object(Ot.jsx)('stop', { offset: '.52', stopColor: '#db2313' }),
														Object(Ot.jsx)('stop', { offset: '.77', stopColor: '#c8140d' }),
														Object(Ot.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#aa0e0b' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial12',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(367.494 187.051 -188.159 365.359 289.025 75.015)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.21' }),
														Object(Ot.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.21' }),
														Object(Ot.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.21' }),
														Object(Ot.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.21' }),
														Object(Ot.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.21' }),
														Object(Ot.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.21' }),
														Object(Ot.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.21' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.21' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial13',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(178.836 91.0261 -91.5654 177.797 213.143 -27.599)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.34' }),
														Object(Ot.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.34' }),
														Object(Ot.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.34' }),
														Object(Ot.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.34' }),
														Object(Ot.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.34' }),
														Object(Ot.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.34' }),
														Object(Ot.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.34' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.34' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial14',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(148.674 75.6735 -76.1219 147.81 224.603 19.902)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.19' }),
														Object(Ot.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.19' }),
														Object(Ot.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.19' }),
														Object(Ot.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.19' }),
														Object(Ot.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.19' }),
														Object(Ot.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.19' }),
														Object(Ot.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.19' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.19' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial15',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(275.869 140.415 -141.247 274.267 218.989 24.987)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.73' }),
														Object(Ot.jsx)('stop', { offset: '.05', stopColor: '#fccdcc', stopOpacity: '.73' }),
														Object(Ot.jsx)('stop', { offset: '.17', stopColor: '#f65954', stopOpacity: '.73' }),
														Object(Ot.jsx)('stop', { offset: '.22', stopColor: '#f32b24', stopOpacity: '.73' }),
														Object(Ot.jsx)('stop', { offset: '.52', stopColor: '#db2313', stopOpacity: '.73' }),
														Object(Ot.jsx)('stop', { offset: '.77', stopColor: '#c8140d', stopOpacity: '.73' }),
														Object(Ot.jsx)('stop', { offset: '.98', stopColor: '#aa0e0b', stopOpacity: '.73' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#aa0e0b', stopOpacity: '.73' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial16',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-706.15 0 0 706.15 172.2 -66.915)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial17',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-522.49 0 0 522.49 198.8 -26.976)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial18',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-1480.2 0 0 1480.2 153.6 -16.316)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#646464' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial19',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(-557.955 0 0 550.74 483.967 178.05)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.02', stopColor: '#fdf7e2' }),
														Object(Ot.jsx)('stop', { offset: '.09', stopColor: '#f8e18c' }),
														Object(Ot.jsx)('stop', { offset: '.13', stopColor: '#f6d86a' }),
														Object(Ot.jsx)('stop', { offset: '.37', stopColor: '#f3cb5a' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#c47313' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#ac4a15' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial20',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'matrix(515.79 0 0 577.571 411.115 200.018)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial21',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(350.2 279.9) scale(243.53)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.49' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial22',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(389.71 331.56) scale(147.05)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.51' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.51' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.51' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.51' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.51' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.51' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.51' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial23',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(389 156.55) scale(1221.5)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.16' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.16' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.16' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.16' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.16' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.16' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.16' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial24',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(323 303.13) scale(277.01)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.5' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.5' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.5' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.5' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.5' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.5' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.5' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial25',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(256.68 346.73) scale(216.54)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: '_Radial26',
													cx: '0',
													cy: '0',
													r: '1',
													gradientUnits: 'userSpaceOnUse',
													gradientTransform: 'translate(415.74 207.61) scale(201.35)',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff', stopOpacity: '.33' }),
														Object(Ot.jsx)('stop', { offset: '.15', stopColor: '#cfad9a', stopOpacity: '.33' }),
														Object(Ot.jsx)('stop', { offset: '.28', stopColor: '#a56643', stopOpacity: '.33' }),
														Object(Ot.jsx)('stop', { offset: '.35', stopColor: '#954a21', stopOpacity: '.33' }),
														Object(Ot.jsx)('stop', { offset: '.65', stopColor: '#541c0b', stopOpacity: '.33' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.33' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#361111', stopOpacity: '.33' }),
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
			(lc.displayName = 'CakeIcon'), (lc.muiName = 'SvgIcon');
			var ic = lc,
				rc = Object(oc.a)(function (e) {
					return Object(Ot.jsx)(
						cc.a,
						Object(m.a)(
							Object(m.a)({}, e),
							{},
							{
								children: Object(Ot.jsxs)('svg', {
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 502 465',
									version: '1',
									children: [
										Object(Ot.jsx)('path', {
											fill: '#c3a985',
											d: 'M434 236c-1 15 0 19-2 33 16 1 30 3 46 8-6 8-17 16-25 20s-15 4-23 5l-10 36c18-3 35-10 52-22 12-8 18-18 25-30 3-5 5-9 5-13 0-11 0-12-3-20-3-5-11-8-14-9-19-4-33-5-51-8z',
										}),
										Object(Ot.jsx)('path', {
											fill: '#c3a985',
											d: 'M446 214c0 118-100 213-223 213S0 332 0 214 100 0 223 0s223 96 223 214z',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#d9c9b3',
											d: 'M446 214c0 118-100 213-223 213S0 332 0 214 100 0 223 0s223 96 223 214z',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#d0bca0',
											d: 'M452 240c-5 0-8 26-3 27l29 6c6 1 14 3 18 0s2-16 1-19c-2-4-10-7-12-8l-33-6z',
										}),
										Object(Ot.jsx)('path', {
											fill: '#e4d9c9',
											d: 'M224 3C103 3 4 101 4 217s98 208 219 208c100 0 185-62 207-147 0-2-1-4-2-2a210 210 0 0 1-205 145c-117 0-213-92-213-205S105 10 223 10c76 0 147 39 185 98 1 2 6 2 4-1A217 217 0 0 0 224 3z',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#c3a985',
											d: 'M437 216c0 113-96 205-214 205S10 329 10 216 105 12 223 12s214 91 214 204z',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#d9c9b3',
											d: 'M434 225c0 108-94 195-211 195S12 333 12 225 106 30 223 30s211 87 211 195z',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#c3a985',
											d: 'M0 222v8c0 130 100 235 223 235a229 229 0 0 0 223-243c-7 116-102 204-223 204S9 335 0 222z',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#c3a985',
											d: 'M411 164c0 80-84 144-187 144S38 244 38 164 121 19 224 19s187 65 187 145z',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#ceba9d',
											d: 'M397 246c11 25 7 36-7 47-17 14-21 47-42 71-13 25-35 24-45 29-22 19-47 7-77-1-14-6-45 15-73 0-28-1-46-21-53-42-19-6-25-32-26-60-12-10-28-25-18-45 7-15 26-58 25-83 0-25 8-31 23-36 5-18 53-52 67-52 30-5 32-10 47-3 16 8 51-8 81 2 14-1 36 29 48 55 6 20 31 33 29 51 2 28 21 18 27 50 3-11-12 26-8 17',
											color: '#000',
										}),
										Object(Ot.jsx)('path', {
											fill: '#b6966b',
											d: 'M421 339a247 247 0 0 1-226 107c-67-7-132-50-169-107 34 73 110 124 191 126a221 221 0 0 0 204-126z',
											color: '#000',
										}),
										Object(Ot.jsxs)('g', {
											color: '#000',
											children: [
												Object(Ot.jsx)('path', { fill: '#b6966b', d: 'M307 248a80 80 0 1 1-160 0 80 80 0 0 1 160 0z' }),
												Object(Ot.jsx)('path', { fill: '#ceba9d', d: 'M303 248a76 76 0 1 1-153 0 76 76 0 0 1 153 0z' }),
												Object(Ot.jsx)('path', {
													fill: '#e4d9c9',
													d: 'M152 219c-37 68 23 99 33 98a80 80 0 0 1-33-98zm153 46c-7 35-40 63-76 63 29 11 74-15 75-53l1-10z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#c3a985',
													d: 'M242 173a76 76 0 0 0-91 67c10-39 46-72 92-61 44 10 63 50 57 89a74 74 0 0 0-58-95z',
												}),
											],
										}),
										Object(Ot.jsx)('path', {
											fill: '#e4d9c9',
											d: 'M453 246c-1 0-4 5-3 6 0 3 0 4 2 6 3 5 11 4 14 4 9 2 13-1 14-4 1-4-3-9-11-11-3-1-10-2-16-1z',
										}),
										Object(Ot.jsx)('path', {
											fill: '#b6966b',
											d: 'M478 277c-6 8-17 16-25 20-6 3-12 4-17 4l-6 17c9-3 28-8 39-16s18-18 20-24h-8l-3-1z',
										}),
										Object(Ot.jsx)('path', { fill: '#e4d9c9', d: 'M491 255c-5-2-6 5-3 8l3 1h3l-1-5-2-4z' }),
										Object(Ot.jsxs)('g', {
											color: '#000',
											children: [
												Object(Ot.jsx)('path', {
													fill: '#410000',
													d: 'M416 227a193 193 0 0 1-385 0c0-107 86-194 192-194s193 87 193 194z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#300',
													d: 'M404 227c0 100-81 182-181 182S42 327 42 227c0-101 81-183 181-183s181 82 181 183z',
												}),
												Object(Ot.jsx)('path', {
													fill: 'none',
													d: 'M263 163c-23 0-47 4-71 13-84 31-129 108-100 172 18 40 60 65 109 71h4a190 190 0 0 0 8 1h1a196 196 0 0 0 9 0h1a227 227 0 0 0 14 0c73-6 134-52 162-117 6-22 5-46-5-68-20-46-73-73-132-72z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#6e3617',
													d: 'M182 49c-26 7-38 13-57 28-24 15-35 32-48 51-12 20-32 42-32 65-5 24 0 48 0 74 5 24 22 46 32 66 14 18 25 35 50 47 17 13 44 21 63 26a212 212 0 0 0 148-33c17-14 28-30 44-51 8-19 26-42 27-63 6-23-2-50-8-73 0-26-18-44-29-65-11-19-31-35-53-48-21-13-38-21-56-27-28-3-51-4-80 2l9-1m-3 25c23-7 42-3 67-1 16 5 32 10 53 21 21 10 26 27 42 44 10 18 23 35 33 55 0 22 3 42 2 63-7 21-13 41-25 57-8 16-18 31-39 43-11 11-42 22-61 27-23 6-40 3-60-1-19-5-36-11-56-21-14-12-42-23-51-41-16-15-15-38-16-59a87 87 0 0 1-8-62c4-19 11-40 25-57 6-17 27-30 44-43 16-11 31-20 55-27l-4 1',
												}),
												Object(Ot.jsx)('path', { fill: '#8f451e', d: 'M51 222c1 3-2 6-7 7s-8 0-9-4 2-6 7-7 8 1 9 4z' }),
												Object(Ot.jsx)('path', { fill: '#210000', d: 'M50 222c1 3-2 6-6 7s-7-1-8-4 2-6 6-7 7 1 8 4z' }),
												Object(Ot.jsx)('path', {
													d: 'M43 219l-3 2-2 1 1-2 4-1zm4 5l-1 1-2 2h-2l1 1h2l4-2v-2h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', { fill: '#8f451e', d: 'M59 261c0 3-2 6-6 7s-8-1-8-4 2-6 6-6 7 0 8 3z' }),
												Object(Ot.jsx)('path', { fill: '#210000', d: 'M58 261c0 3-2 5-5 6s-7 0-7-3 1-5 5-6 6 1 7 3z' }),
												Object(Ot.jsx)('path', {
													d: 'M51 259l-2 1c-2 0-1 2-2 1s0-1 2-2h2zm5 4l-2 1-1 1-2 1 1 1h1l4-2v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M71 299c1 5-3 9-9 11s-12-1-13-6 4-9 10-10 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M70 299c1 4-3 9-8 10s-10-1-11-5 2-8 8-10 10 1 11 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M60 296l-3 2-4 2 2-3 5-1zm7 6l-2 2-3 2-2 1v1h3c2 0 4-2 5-3v-2l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M75 176c1 5-4 12-12 13s-15-1-17-7 4-12 12-14 16 2 17 8z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M73 176c2 5-3 11-10 12s-14-1-15-6 4-11 11-13 13 2 14 7z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M60 171c1 1-2 2-4 3l-5 2c-1-1 1-3 3-4l6-1zm9 9l-3 2-3 2-3 1c-1 1 0 2 1 2h3c3 0 6-2 7-4v-3h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M75 196c1 4-3 8-8 9s-11-1-12-5 3-8 8-9 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M74 196c0 4-3 8-8 9s-9-1-10-5 3-7 8-8 9 1 10 4z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M65 193l-3 2-3 1 1-2c1-1 4-2 5-1zm6 6l-2 1-3 2-2 1 1 1h3l4-3v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M85 235c1 4-3 9-9 10s-12-1-13-5 3-10 9-11 12 1 13 6z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M84 235c0 4-3 8-9 9s-10-1-11-5 3-8 8-9 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M73 231c1 1-1 1-3 2l-3 2c0-1 0-2 2-3l4-1zm7 7l-2 2-3 1-2 1 1 2h3l5-4v-2h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M88 254c1 5-3 9-8 10s-11-1-12-5 3-9 8-10 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M87 255c1 3-2 7-7 9s-10-1-11-5 2-8 8-9 9 1 10 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M78 251l-3 2-4 2 2-3 5-1zm6 6l-2 2-2 2h-3l1 2h3l4-3v-2l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M104 333c1 3-2 7-7 8s-9-1-10-4 2-8 7-9 9 1 10 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M103 333c1 3-2 6-6 7s-9 0-9-4 2-6 6-7 9 1 9 4z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M95 330l-2 2-3 1s0-2 2-2l3-1zm5 5l-1 2-2 1-2 1v1h3l4-3v-2h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M107 353c1 3-2 6-6 7s-8-1-8-4 2-6 6-7 7 1 8 4z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M106 353c1 2-2 5-5 6s-7-1-8-3 2-6 6-6 7 0 7 3z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M100 350l-3 2-2 1 2-2 3-1zm4 5l-1 1-2 1h-2l1 1h2l3-2v-1h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M91 131c1 5-4 10-11 12s-13-1-14-6 4-11 10-12 13 1 15 6z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M89 131c1 5-3 10-9 11s-12-1-13-6 3-9 9-10 12 1 13 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M78 127l-4 3-4 2 3-4 5-1zm7 8l-2 2-3 2h-3l1 2h4l5-4v-2h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M142 365c1 5-3 10-10 11s-11-1-12-6 3-9 9-10 12 1 13 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M141 366c0 4-3 8-9 9s-10-1-11-5 3-8 8-10 11 2 12 6z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M130 362l-3 2-3 2s0-2 2-3l4-1zm7 6l-2 2-3 2-2 1 1 1h3c2 0 4-2 5-3v-2l-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M113 106c1 5-3 10-11 12s-13-1-15-7 4-10 11-12 14 1 15 7z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M112 106c1 5-3 10-10 11s-12-1-13-6 3-10 9-11 13 1 14 6z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M100 102l-4 2c-2 1-3 3-4 2s0-2 2-4 5-1 6 0zm8 7l-3 2-3 2-3 1 1 2h4l6-4v-2l-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M113 126c1 4-2 7-7 8s-9-1-10-4 3-7 7-8 9 1 10 4z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M112 126c1 3-2 7-6 7s-8 0-9-3 2-7 6-8 8 1 9 4z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M104 123c1 1-1 1-2 2l-3 1c-1-1 0-1 2-2l3-1zm5 5l-1 2-2 1-2 1 1 1h2l4-3v-1l-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M131 346c1 4-3 8-8 9s-11-1-12-5 3-8 8-10 11 1 12 6z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M130 346c1 4-2 8-8 9s-9-1-10-5 2-8 7-9 10 1 11 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M121 342l-3 2-4 2 2-3 5-1zm6 6l-2 2-3 2-2 1 1 1h3l4-3v-2l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M171 379c1 4-3 8-8 10s-11-1-11-5 2-9 8-10 10 1 11 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M170 380c1 3-2 7-7 8s-10-1-10-5 2-7 7-8 9 1 10 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M161 376l-3 2-3 2s0-2 2-3l4-1zm6 6l-2 2-2 1-2 1v1h3c2 0 4-1 4-3v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M81 281c1 4-3 9-9 10s-12-1-13-5 3-10 9-11 12 1 13 6z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M80 281c1 4-3 8-8 9s-11-1-12-5 3-8 9-9 10 1 11 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M70 277l-3 2c-1 1-3 3-4 2s0-2 2-3l5-1zm7 7l-2 2-3 1-2 1v2h3l5-4v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M209 391c1 7-5 14-14 16s-18-2-19-8 4-14 13-16 18 2 20 8z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M207 392c1 6-4 12-12 14s-16-2-18-8 5-12 13-14 15 2 17 8z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M192 386l-5 3-5 3c0-1 0-3 3-5s6-2 7-1zm9 10l-2 3-5 2-3 1 1 3h4c4-1 7-3 8-6v-3h-3z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M227 387c1 4-2 8-7 9s-9-1-10-5 2-7 7-8 9 1 10 4z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M226 387c1 4-2 7-6 8s-9-1-9-4 2-7 6-8 9 1 9 4z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M218 384c1 1-1 1-2 2l-3 1 1-2 4-1zm5 6l-1 1-2 1-2 1v1h3l4-3v-1h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M258 401c1 3-3 7-7 8s-10-1-10-4 2-8 7-9 9 1 10 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M257 401c1 3-2 7-6 7s-9 0-10-4 3-6 7-7 8 1 9 4z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M249 398l-3 2-2 1 1-2 4-1zm5 5l-1 2-3 1-1 1v1h3l3-3v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M290 394c1 6-4 12-12 14s-16-2-17-8 4-12 12-14 16 2 17 8z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M289 394c1 5-4 11-11 12s-14-1-15-6 3-11 10-13 14 2 16 7z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M275 389c1 1-2 1-4 3l-5 2c-1-1 0-3 3-4l6-1zm9 9l-3 2-3 2-3 1v2h4c3 0 6-2 7-4v-3h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M310 369c2 5-3 10-10 12s-14-1-15-7 3-10 10-12 14 1 15 7z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M309 369c1 5-3 10-10 11s-12-1-13-6 3-10 10-11 12 1 13 6z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M297 365l-4 2c-2 1-3 3-4 2s1-2 3-4 5-1 5 0zm8 7l-2 2-4 2-2 1v2h4c3-1 5-2 6-4v-2l-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M301 64c1 6-5 13-13 15s-17-2-19-8 5-14 13-16 17 2 19 9z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M299 64c1 6-4 12-12 14s-15-2-16-8 4-12 12-13 15 1 16 7z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M284 59l-4 3c-2 2-5 3-5 2s0-3 3-4l6-1zm10 9l-3 3-4 2-3 1c-1 1 0 2 1 2l4 1c3-1 6-3 7-6v-2l-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M355 338c0 4-3 7-8 8s-9 0-10-4 3-7 8-8 9 1 10 4z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M354 338c0 4-3 7-7 8s-8-1-9-4 3-6 7-7 8 0 9 3z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M346 336l-3 1-2 2 1-3h4zm5 5l-2 1-2 1-2 1 1 1h2c2 0 3-1 4-3v-1h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', { fill: '#8f451e', d: 'M355 359l-4 4c-2 1-4-1-5-2s1-4 4-4 4 0 5 2z' }),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M354 359c0 1-1 3-3 3l-4-1c0-1 1-4 3-4s4 0 4 2z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M350 357l-1 1-1 1v-1l2-1zm3 3l-1 1h-1l-1 1h1l2-1v-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', { fill: '#8f451e', d: 'M323 79c1 3-2 6-6 7s-8-1-9-4 3-6 7-7 7 1 8 4z' }),
												Object(Ot.jsx)('path', { fill: '#210000', d: 'M322 79c1 3-2 6-5 7s-7-1-8-4 2-5 6-6 7 1 7 3z' }),
												Object(Ot.jsx)('path', {
													d: 'M315 77l-2 1-2 1 1-2h3zm5 4l-1 1-2 2h-2l1 1h2l3-2v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M331 98c1 4-3 9-9 11s-12-2-13-6 3-10 9-11 12 1 13 6z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M330 98c1 4-3 9-8 10s-11-1-12-5 3-9 8-10 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M320 94l-4 2-3 2c0-1 0-2 2-3l5-1zm7 7l-2 2-3 2h-3l1 2h3l5-4v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M382 312c2 5-4 12-12 13s-15-1-16-7 4-12 12-14 15 2 16 8z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M381 312c1 5-4 11-11 12s-14-1-15-6 4-11 11-13 14 2 15 7z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M368 307l-5 3-4 2c0-1 0-3 2-4l7-1zm8 9l-2 2-4 2-3 1 1 2h4c3 0 5-2 6-4v-3h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M414 229c0 3-3 7-8 8s-9-1-9-4 2-7 7-8 9 0 10 4z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M413 229c0 3-2 7-7 8s-8-1-9-4 3-7 7-8 8 1 9 4z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M405 226l-3 2-2 1 1-2 4-1zm5 5l-2 2-2 1-1 1v1h2c2 0 4-2 4-3v-1l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M396 268c0 4-3 8-9 9s-10-1-11-5 3-8 8-9 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M394 268c1 3-2 7-7 8s-9-1-10-4 2-8 7-9 10 1 10 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M385 265l-3 1c-2 0-2 2-3 2l2-3h4zm6 5l-1 2-3 2h-2l1 2h2l5-4v-1l-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M397 288c1 3-2 6-6 7s-8-1-8-4 2-6 6-7 8 1 8 4z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M397 288c0 3-2 5-6 6s-7 0-7-3 1-6 5-6 7 0 8 3z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M390 286l-2 1-3 1 2-2h3zm4 4l-1 1-2 1-1 1v1h2l3-3v-1h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M384 132c1 4-3 9-9 10s-11-1-12-5 3-9 9-10 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M383 132c0 4-3 8-8 9s-10-1-11-5 3-7 8-9 10 1 11 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M373 129l-3 2-3 1c0-1 0-2 2-3h4zm6 6l-2 2-2 1-2 1v1h3c2 0 4-1 5-3v-2h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M402 164c1 5-3 10-10 11s-12-1-13-6 3-10 9-11 13 1 14 6z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M401 164c1 4-3 9-9 10s-11-1-12-5 3-9 9-10 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M390 160l-4 3c-2 2-3 2-3 1s0-2 2-3l5-1zm7 7l-2 2-3 2-3 1 1 1h3c3 0 5-2 6-3v-3h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M405 184c0 4-3 8-9 9s-10-1-11-5 3-8 8-9 11 1 12 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M403 184c1 4-2 7-7 9s-9-1-10-5 2-7 7-9 10 1 10 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M394 181l-3 2c-2 1-2 2-3 1s0-2 2-3h4zm6 6l-1 1-3 2h-2l1 2h2l5-3v-2h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M406 204c1 3-2 6-6 7s-7-1-8-4 2-6 6-7 7 1 8 4z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M405 204c1 3-2 5-5 6s-7-1-7-3 2-5 5-6 7 1 7 3z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M399 202l-2 1-2 1 1-2h3zm4 4l-1 1-2 1-1 1v1h2l3-3v-1h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#6e3617',
													d: 'M266 83c-3 8 13 7 4 17 3 4-2 12-1 16-11 9-28 20-35 24l-21 12c-16 6-35 12-39 10-14 4-23 4-24 0-4-4-15-6-25-7 1-7-4-13-11-16-9-4 14-18 9-21-3-6 8-15 9-19 1-6 10-12 24-20 2-3 17-12 30-16 3-2 16-4 33-8 7-1 19 0 20 4 15-1 12 5 24 6 11 2-4 15 4 18',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M164 102c-1 6-8 10-16 9s-14-7-14-13 8-10 16-9 15 7 14 13z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M162 102c0 5-7 9-14 8s-13-6-12-11 7-9 14-9 13 6 12 12z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M151 93l-5 1h-5c-1-1 1-2 4-3s6 1 6 2zm6 10l-4 2-4 1h-3v2l4 1c3 1 6 0 8-2l1-2-2-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M154 120c0 5-7 9-14 8s-13-6-13-11 7-9 15-9 13 6 12 12z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M153 120c-1 4-7 8-13 7s-12-5-11-10 6-8 13-8 11 6 11 11z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M143 111l-5 2h-4l3-3c2-1 5 1 6 1zm5 10l-3 2-4 1h-3v1l3 2 7-2c1-1 2-2 1-3l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M145 141c-1 3-4 6-9 5s-7-3-7-7 4-5 9-4 7 3 7 6z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M144 141c0 3-4 5-8 4s-6-3-6-5 4-5 8-5 6 3 6 6z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M138 136l-3 1h-2l2-1h3zm3 6l-2 1h-4l1 2h1l5-1v-1l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M189 64c0 4-4 6-9 6s-8-4-8-7 5-6 10-6 8 4 7 7z',
												}),
												Object(Ot.jsx)('path', { fill: '#210000', d: 'M188 64c0 3-4 6-8 5s-7-3-7-6 4-6 8-5 8 3 7 6z' }),
												Object(Ot.jsx)('path', {
													d: 'M182 59l-3 1h-3l2-1h4zm3 6l-2 1-2 1h-2v1l2 1 5-1v-2l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M196 87c0 7-9 12-19 11s-17-8-16-15 9-13 19-12 17 8 16 16z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M194 86c0 7-8 11-17 10s-15-7-14-13 8-11 17-10 15 7 14 13z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#896262',
													d: 'M181 75c0 2-3 1-6 2l-6 1c0-1 1-3 5-4s6 0 7 1zm7 14l-4 2-5 1h-4v2l4 2c4 0 8-1 10-3l1-3-2-1z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M192 112c-1 5-7 9-15 8s-12-6-12-11 7-10 15-9 12 6 12 12z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M190 111c0 5-6 8-13 8s-11-5-10-10 6-8 12-8 12 6 11 10z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M180 103c1 1-2 1-4 1l-5 1c-1-1 1-2 4-3s5 0 5 1zm5 10l-3 2h-6v2l3 1c3 1 5 0 7-2l1-2-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M181 124c-1 5-6 8-13 7s-11-5-11-10 7-8 13-7 12 5 11 10z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M180 124c-1 4-6 7-12 7s-10-5-9-9 5-8 11-7 10 5 10 9z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M171 117l-4 1h-4c0-1 1-2 3-2l5 1zm4 9l-2 1h-6v2l3 1c2 0 5 0 6-2l1-2h-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M196 148c-1 10-13 17-27 15s-25-11-23-21 13-18 27-16 24 11 23 22z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M193 147c-1 10-12 16-24 14s-22-10-21-19 12-15 25-14 22 10 20 19z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M174 132c1 1-4 1-8 2s-8 3-9 1 2-4 7-5 10 0 10 2zm10 19l-6 2-7 2h-5v3c1 2 4 3 6 3 5 0 10-1 14-4 1-1 2-3 1-4-1-2-2-2-3-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', { fill: '#8f451e', d: 'M209 69c0 2-3 3-6 3s-5-2-5-5 3-3 6-3 5 2 5 5z' }),
												Object(Ot.jsx)('path', { fill: '#210000', d: 'M208 69c0 2-2 3-5 3s-4-3-4-4 2-4 5-3 5 2 4 4z' }),
												Object(Ot.jsx)('path', {
													d: 'M204 65l-2 1h-1l1-1h2zm2 4l-1 1h-3l1 1h4v-1l-1-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', { fill: '#8f451e', d: 'M212 87c0 3-4 5-8 4s-6-3-6-5 4-5 8-5 6 3 6 6z' }),
												Object(Ot.jsx)('path', { fill: '#210000', d: 'M211 87c0 3-3 4-7 4s-6-3-5-5 3-5 6-4 6 2 6 5z' }),
												Object(Ot.jsx)('path', {
													d: 'M206 83h-2l-3 1 2-2c1-1 3 0 3 1zm2 5l-1 1h-3v1l1 1 4-1v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M212 109c0 3-4 5-8 5s-7-4-7-7 4-5 8-5 7 4 7 7z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M211 109c0 2-3 4-7 4s-6-3-6-6 3-4 7-4 7 3 6 6z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M206 104l-3 1h-3c-1-1 1-1 2-1h4zm2 6l-1 1h-4v1l2 1 4-1v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M231 148c-1 8-10 13-21 12s-19-8-18-16 11-14 21-13 19 9 18 17z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M229 148c-1 7-9 12-19 11s-17-8-16-15 10-12 19-11 17 8 16 15z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M214 136c1 1-3 1-6 1s-6 2-7 1 2-3 5-4 8 1 8 2zm8 14l-5 2-5 2h-4v2l5 2c4 0 8-1 10-3 1-1 2-2 1-3l-2-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M250 73c-1 6-9 11-18 10s-16-7-15-14 9-12 18-11 16 8 15 15z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M248 72c0 6-8 11-16 10s-14-7-13-13 8-10 16-9 14 6 13 12z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M236 62l-6 2h-5l4-3c3-1 6 0 7 1zm6 13l-4 1-4 1h-4v3l4 1 9-2c1-1 2-2 1-3l-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M241 96c-1 6-7 10-15 9s-13-6-13-12 8-9 15-9 14 6 13 12z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M239 96c0 5-6 8-13 8s-12-6-11-11 6-8 13-8 12 6 11 11z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M229 88l-5 1h-4c0-1 1-2 3-2l6 1zm5 10l-3 1-4 1h-3l1 2 3 1c3 1 5 0 7-2l1-2-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M232 113c0 2-2 3-4 3s-4-2-4-4 3-2 5-2 3 2 3 3z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M232 113c0 2-2 2-4 2s-3-1-3-3 2-2 4-2 3 2 3 3z',
												}),
												Object(Ot.jsx)('path', { d: 'M229 111h-3l1-1 2 1zm1 3h-2v1h3v-1h-1z', fill: '#e3b7b7' }),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M229 129c0 3-3 5-7 4s-6-3-6-5 4-5 7-4 7 2 6 5z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M229 129c-1 2-3 4-7 4s-5-3-5-5 3-4 6-4 6 3 6 5z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M224 125l-2 1h-3l2-1h3zm2 5l-1 1h-3v1h1c2 1 3 0 4-1v-1h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', { fill: '#8f451e', d: 'M267 75c0 3-4 5-8 5s-7-4-7-7 4-5 8-5 8 4 7 7z' }),
												Object(Ot.jsx)('path', { fill: '#210000', d: 'M266 75c0 2-3 4-7 4s-7-3-6-6 3-5 7-4 7 3 6 6z' }),
												Object(Ot.jsx)('path', {
													d: 'M261 70l-3 1h-3c-1-1 1-1 2-2s3 1 4 1zm2 6l-1 1h-4v1l2 1 4-1v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M266 92c0 4-5 7-11 7s-10-5-9-9 5-7 11-7 10 5 9 9z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M265 92c0 4-5 6-10 6s-9-4-8-8 5-6 10-6 9 4 8 8z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M257 86h-3c-2 0-3 2-4 1s1-2 3-2l4 1zm4 7l-2 1-3 1h-2v1l3 1c2 1 4 0 5-1l1-2-2-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M272 116c-1 8-10 13-20 11s-17-8-16-15 9-12 19-11 18 8 17 15z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M270 116c-1 7-9 11-18 10s-15-7-14-14 8-11 17-10 16 7 15 14z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M256 105c1 1-3 1-6 2h-6c-1-1 1-3 5-3l7 1zm7 13l-4 2-5 1h-4v3l5 2c3 0 7-1 9-3 1-1 2-2 1-3l-2-2z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#8f451e',
													d: 'M259 136c0 3-4 6-9 5s-9-4-8-7 4-6 9-6 9 4 8 8z',
												}),
												Object(Ot.jsx)('path', {
													fill: '#210000',
													d: 'M258 136c0 3-4 5-8 4s-8-3-7-6 4-6 8-5 8 3 7 7z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M252 130l-3 1h-3l2-1h4zm3 7l-2 1h-4v1l2 1 5-1v-2h-1z',
													fill: '#e3b7b7',
												}),
												Object(Ot.jsx)('path', {
													fill: '#6e3617',
													d: 'M248 369c52-8 99-45 116-92 13-32 18-37 4-67-4-6-13-4-18-1-68 72-211 10-243 71-4 8-3 19 1 25 25 46 83 73 140 64z',
												}),
											],
										}),
									],
								}),
							},
						),
					);
				});
			(rc.displayName = 'CoffeeIcon'), (rc.muiName = 'SvgIcon');
			var pc = rc,
				jc = Object(oc.a)(function (e) {
					return Object(Ot.jsx)(
						cc.a,
						Object(m.a)(
							Object(m.a)({}, e),
							{},
							{
								children: Object(Ot.jsx)('svg', {
									viewBox: '0 0 540 540',
									xmlns: 'http://www.w3.org/2000/svg',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.41421',
									children: Object(Ot.jsx)('path', {
										d: 'M269.215.244l-270 270 270 270 270-270-270-270zm-190 81v103l36-36c1-14-1-28-9-40 13 7 26 9 41 8l35-35h-103zm276 0l36 35c14 1 28-1 40-8-7 12-9 26-8 40l36 36v-103h-104zm-86 13c32 34 73 17 73 73h31v31c56 0 39 45 72 72-33 31-15 73-72 73v31h-31c-1 56-41 37-73 73-33-36-72-17-73-73h-31v-31c-55 0-37-44-73-73 37-27 18-72 73-72v-31h31c-1-56 40-38 73-73zm0 6l-1 1c-13 12-29 18-45 25-9 3-17 10-20 19-3 8-3 17-3 26h-31v31c-11 0-22 0-31 7h-1c-8 7-12 17-16 27-5 12-11 25-21 34l-1 1 1 1c11 11 18 26 24 41 4 9 9 18 18 22s18 4 27 4v31h31c0 11 0 23 7 32 6 9 15 13 24 16 13 5 26 12 37 22l1 1 1-1c12-12 28-19 44-25 8-3 16-9 19-18 4-8 4-18 4-27h31v-31c11 0 23 0 33-6 10-7 14-18 18-28 5-12 11-24 19-33l1-1-1-1c-11-11-17-26-22-40-4-9-9-19-19-23-8-5-20-5-29-5v-31h-31c1-11 0-23-6-33-6-9-16-13-25-16-13-6-26-12-36-21l-1-1zm0 3c10 10 23 16 36 21 9 4 18 8 24 16 6 9 6 21 6 32v1h31v31h1c9 0 21 1 29 5 9 4 14 13 17 22 6 14 12 29 23 40-9 9-15 21-19 33-4 10-8 21-17 26-10 6-22 7-33 6h-1v31h-31v2c0 9 0 19-4 27-3 8-11 13-18 17-16 6-32 12-44 24-11-10-24-16-37-21-9-4-18-8-23-15-6-9-6-21-6-32v-2h-31v-31h-2c-9 1-18 0-26-3-9-4-14-13-18-21-5-15-12-30-23-41 9.356-9.697 16.518-21.293 21-34 3-10 7-20 15-26 9-6 21-7 31-7h2v-31h30v-1c0-9 1-18 4-26 2-9 10-14 18-18 15-6 32-13 45-25zm0 59l-24 2c-.823 0-1.5.677-1.5 1.5s.677 1.5 1.5 1.5c.314-.004.629-.006.943-.006 43.338 0 79 35.662 79 79s-35.662 79-79 79-79-35.662-79-79c0-.998.019-1.996.057-2.994.054-.161.081-.33.081-.5 0-.867-.714-1.581-1.581-1.581-.679 0-1.285.437-1.5 1.081-2.428 9.135-3.658 18.548-3.658 28.001 0 59.666 48.992 108.812 108.658 108.999 55.615-5.345 98.572-52.629 98.572-108.5s-42.957-103.155-98.572-108.5zm0 2c58.069.117 105.786 47.931 105.786 106 0 58.15-47.851 106-106 106-58.15 0-106-47.85-106-106 0-5.356.406-10.705 1.214-16 4.476 40.873 39.401 72.182 80.519 72.182 44.435 0 81-36.565 81-81 0-40.118-29.806-74.495-69.519-80.182l13-1zm13 5l16 10c24 18 37 50 32 80-5 31-29 59-59 68-30 10-65 2-86-22-3-3-9-8-17-24 0 8 2 16 3 19 12 37 46 67 85 72 4.27.543 8.571.816 12.876.816 55.955 0 102-46.044 102-102 0-12.591-2.331-25.074-6.876-36.816-10-28-34-52-63-61-1 0-11-4-19-4zm-24 27l-7 8 2 47c-1 6 2 15-4 18-7 3-16 4-21-1-5-6-3-15-2-21-5 5-8 13-8 21 0 7 4 13 11 14h12c9-3 14-11 18-19 7 4 15 4 22 1 8-2 18-5 26 0 5 7 7-5 11-8 6-4-1-3-5-4-11-3-18-14-29-16-6-3-13 2-16 7 1 3 8 3 11 6 3-3 8-1 10 3-3 3-11 1-15 2-6 0-13 0-16-6v-52zm-48 2l-2 4c-5 5 0 9 2 14v35c1 6-1 13-8 15-6 1-12 1-18-2-6-2-4-11-5-15-4 4-5 9-5 14-1 8 6 13 13 13l4 1c11 1 21-8 24-18l1-37c-1-6 3-13 3-19-3 0-7-5-9-5zm17 15c-4 0-8 2-7 7 0 6 7 8 12 10 1-2 4-6 7-4 7 4 8 12 8 19l1 5c3-4 3-12 3-18-1-10-10-18-20-19h-4zm-148 144v103h103l-35-35c-15-2-29 0-41 8 8-12 10-26 9-40l-36-36zm380 0l-36 36c-1 14 1 28 8 40-12-8-26-9-41-8l-35 35h104v-103z',
										fill: '#117b51',
										fillRule: 'nonzero',
									}),
								}),
							},
						),
					);
				});
			(jc.displayName = 'HalalIcon'), (jc.muiName = 'SvgIcon');
			var dc = jc,
				uc = Object(oc.a)(function (e) {
					return Object(Ot.jsx)(
						cc.a,
						Object(m.a)(
							Object(m.a)({}, e),
							{},
							{
								children: Object(Ot.jsxs)('svg', {
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 64 64',
									version: '1',
									children: [
										Object(Ot.jsxs)('defs', {
											children: [
												Object(Ot.jsxs)('radialGradient', {
													id: 'a',
													gradientUnits: 'userSpaceOnUse',
													cy: '15.163',
													cx: '15.891',
													r: '27.545',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#fff' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#00f038', stopOpacity: '0' }),
													],
												}),
												Object(Ot.jsxs)('radialGradient', {
													id: 'b',
													gradientUnits: 'userSpaceOnUse',
													cy: '16.847',
													cx: '16.028',
													gradientTransform: 'matrix(.91888 .94532 -.71707 .69701 13.381 -10.047)',
													r: '27.545',
													children: [
														Object(Ot.jsx)('stop', { offset: '0', stopColor: '#ff9b9b' }),
														Object(Ot.jsx)('stop', { offset: '1', stopColor: '#f00000' }),
													],
												}),
											],
										}),
										Object(Ot.jsx)('path', {
											d: 'M55.091 27.727a27.545 27.545 0 1 1-55.091 0 27.545 27.545 0 1 1 55.091 0z',
											transform: 'translate(4.496 4.3147) scale(.99849)',
											fill: 'url(#a)',
										}),
										Object(Ot.jsx)('path', {
											d: 'M55.091 27.727a27.545 27.545 0 1 1-55.091 0 27.545 27.545 0 1 1 55.091 0z',
											transform: 'translate(4.496 4.3147) scale(.99849)',
											strokeLinejoin: 'round',
											stroke: '#be0000',
											strokeLinecap: 'round',
											strokeWidth: '2.5038',
											fill: 'url(#b)',
										}),
										Object(Ot.jsx)('path', {
											d: 'M36.094 18.812c-1.798 1.551-3.145 4.37-4.532 5.844-2.631-2.177-3.818-6.236-6.656-7.375-3.44.919-8.904 4.136-4.875 7.625 2.058 3.043 6.195 5.747 7.157 8.906-1.468 3.79-4.292 6.616-7.032 9.376 1.34 4.675 7.755.524 10.344-1.75 2.065-4.634 3.568.898 5.499 2.891 1.541 6.222 9.801 4.403 10.521-.74-2.84-4.549-6.781-8.924-9.52-13.401 1.085-4.655 5.63-7.771 6.69-12.282-1.79-3.122-5.284.353-7.596.906z',
											fill: '#fff',
										}),
									],
								}),
							},
						),
					);
				});
			(uc.displayName = 'RedCrossofShameIcon'), (uc.muiName = 'SvgIcon');
			var fc = uc,
				bc = Object(oc.a)(function (e) {
					return Object(Ot.jsx)(
						cc.a,
						Object(m.a)(
							Object(m.a)({}, e),
							{},
							{
								children: Object(Ot.jsx)('svg', {
									viewBox: '0 0 523 479',
									xmlns: 'http://www.w3.org/2000/svg',
									fillRule: 'evenodd',
									clipRule: 'evenodd',
									strokeLinejoin: 'round',
									strokeMiterlimit: '1.414',
									children: Object(Ot.jsxs)('g', {
										fillRule: 'nonzero',
										children: [
											Object(Ot.jsx)('path', {
												d: 'M52.437 193.9c-15.64-303.35 121.8-74.13 202.84 16.57 74.63 59.84 233.43 163.71 233.43 163.71s-4.96 53.11-.26 53.93c0 0-78.52 34.22-79.96 34.64-39.96-7.31-81.06-29.05-115.73-49.86-24.28-13.58-78.72-53.28-99.31-72.42-56.09-42.96-97.39-92.99-141.01-146.57z',
												fill: '#dec5a3',
											}),
											Object(Ot.jsx)('path', {
												d: 'M51.297 210.49c-2.4-3.79-10.28-16.21-17.5-27.6-7.22-11.38-15.12-25.88-17.56-32.22-2.43-6.34-6.15-14.3-8.26-17.69-7.07-11.37-8.74-21.7-6.6-40.71 1.39-12.26 4.54-22.25 8.99-28.49 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-4.74-1.05-9.12-3.41-9.72-5.23-3.18-9.6 26.85-45.06 32.93-38.89 6.36 6.45 8.41 12.09 7.23 19.87-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.25-.38 6.46-1.36 3.98-3.22 35.95-1.11 38.97 2.58 1.62 1.98 4.5 3.83 6.38 4.11 11.52 1.7 22.79 12.83 76.29 75.37 54.52 63.73 84.93 94.85 120.42 123.25 37.67 30.14 44.95 35.44 71.24 51.72 46.4 28.76 64.64 39.47 68.52 40.23 7.02 1.39 44.12 31.31 52.5 42.35 7.95 10.47 11.95 21.28 13.47 36.36.94 9.37 2 17.38 2.34 17.81.35.43 3.2-1.38 6.32-4.02 7.25-6.11 14.25-.52 12.94 10.35-1.59 13.13-1.69 14.99-1.28 24.51.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.94-13.85-7-14.29-20.99-2.26-11.94 10.27-44.02 23.6-47.26 19.64-.73-.88-2.19-.89-3.25-.02-2.61 2.13-24.5-.02-37.12-3.65-38.48-11.08-127.84-58.89-156.8-83.88-13.35-11.53-44.39-36.97-54.37-44.57-4.26-3.24-19.31-16.86-33.44-30.27-14.14-13.41-31.09-29.4-37.67-35.54-12.12-11.3-49.37-55.63-57.4-68.3zm98.43-40.36c12.54-10.2 16.55-9.98 26.19 1.39 7.66 9.03 8.06 10.88 5.63 25.69l-2.62 15.95 14.06.78 14.07.79 3.05 11.36c3.36 12.49 7.4 14.1 16.65 6.63 2.46-1.98 6.84-3.15 9.72-2.59 4.27.83 5.17 2.24 4.91 7.61-.18 3.62 1.88 9.29 4.58 12.59 2.96 3.61 4.59 10.03 4.12 16.16-.79 10.1 3.05 14.57 8.62 10.01 7.31-5.99 17.59-6.2 22.3-.44 2.62 3.2 4.3 7.16 3.73 8.82-1.65 4.79 6.91 13.56 10.43 10.68 3.83-3.14 23.55 5.21 29.52 12.5 2.42 2.96 7.93 6.49 12.23 7.84 7.4 2.33 8 3.16 10.91 15.4l3.08 12.94 6.18-5.05c8.04-6.59 17.36-3.29 20.12 7.13 1.04 3.95 2.35 7.19 2.9 7.19.55 0 4.03-.64 7.72-1.41 4.39-.92 8.28.51 11.25 4.14 2.49 3.05 8.42 6.05 13.17 6.68 7.87 1.03 8.89 1.93 11.4 10.11 4.76 15.49 8.18 18.37 15.85 13.37 9.83-6.41 12.88-5.34 26.86 9.35l12.53 13.16-4.89-16.05c-5.68-18.63-12.75-25.44-23.48-22.6-6.59 1.74-7.73 1.03-13.34-8.4-5.37-9.01-7.41-10.47-16.1-11.54-11.36-1.41-23.1-7.44-24.87-12.78-.66-2-4.54-3.8-8.61-4-4.08-.21-8.97-2.27-10.87-4.59-1.9-2.32-6.4-4.66-10.01-5.2-6.12-.92-6.76-1.94-9.56-15.21-3.37-16.03-6.86-19.69-13.54-14.22-8.08 6.61-17.89 5.44-26.93-3.24-4.6-4.42-11.21-10.12-14.67-12.68-4.25-3.12-7.34-8.48-9.46-16.39-3.06-11.38-3.34-11.72-8.86-10.9-23.45 3.51-30.5-1.58-30.84-22.23-.26-15.92-3.87-21.29-10.62-15.77-8.04 6.59-18.19 3.45-25.12-7.78-3.29-5.34-8.3-10.45-11.22-11.43-4.13-1.4-5.3-3.81-5.45-11.18-.18-9.4-.18-9.4-8.65-11.28-9.01-2-17.03-9.57-15.34-14.5.6-1.75-3.01-3.99-8.76-5.45l-9.79-2.48 2.57-13.64 2.57-13.63-10.75 2.66c-5.91 1.47-11.09 2.26-11.5 1.75-.41-.5-1.61-5-2.67-9.99-1.82-8.57-2.39-9.15-10.06-10.16-10.48-1.37-15.64-7.86-16.26-20.45-.39-7.75-1.68-10.47-5.64-11.83-2.82-.98-7.61-5.67-10.64-10.42-5.54-8.7-13.51-12.47-18.22-8.62-1.57 1.29-.04 4.36 4.22 8.47 5.45 5.27 6.16 7.66 3.86 13.04-4.08 9.53-4.14 9.44 5.82 9.25 10.92-.22 14.27 3.24 14.5 14.98.15 8.05.78 9 7.29 11.05 10.81 3.4 18.62 14.26 14.41 20.05-3.44 4.73-.73 8.56 10.02 14.23 3 1.58 3.79 6.24 2.6 15.35-.94 7.19-1.14 13.79-.46 14.67.69.88 5.26-1.66 10.16-5.64zm336.85 209.77c1.74-1.43 1.61-4.43-.29-6.75-1.9-2.33-4.82-3.04-6.56-1.62-1.74 1.43-1.62 4.43.29 6.76 1.9 2.32 4.82 3.04 6.56 1.61z',
												fill: '#c25628',
											}),
											Object(Ot.jsx)('path', {
												d: 'M68.087 230.81c-1.29-4.13 4.09-9.25 6.56-6.24.94 1.15 3.65.5 6.01-1.44 2.37-1.93 3.07-3.95 1.56-4.47-1.51-.52-2.02-2.47-1.14-4.34.88-1.87-.19-1.27-2.39 1.33-2.59 3.07-4.83 3.7-6.39 1.78-1.33-1.62-3.65-2.05-5.16-.96-1.9 1.36-2.26 1.06-1.16-.97 1.73-3.2-6.16-10.23-8.94-7.96-.93.77-.37 3.84 1.25 6.84 2.27 4.21 1.69 4.05-2.56-.7-3.03-3.38-5.3-8.27-5.04-10.87.34-3.4-.52-4.6-3.07-4.29-2.04.24-5.57-2.96-8.3-7.55l-4.76-7.97 7.96 1.85c5.45 1.27 7.17.85 5.47-1.34-1.37-1.76-2.72-5.37-3-8.03-.45-4.28 0-4.66 4.12-3.37 2.54.8 3.77.38 2.73-.93-1.05-1.31-4.27-2.4-7.17-2.42-3.64-.03-4.68.69-3.35 2.31 1.06 1.29 1.11 3.01.12 3.82-.99.81-3.56-1.41-5.71-4.93-3.66-6-3.79-6-2.12-.01 2.16 7.77.66 9.58-3.61 4.36-1.74-2.12-3.06-7.57-2.93-12.11.13-4.53-.64-9.25-1.71-10.49-1.07-1.23-1.83.72-1.69 4.34.25 6.49.21 6.52-3.16 2.41-1.87-2.29-3.28-5.77-3.12-7.72.16-1.96-1.56-6.76-3.83-10.67-2.26-3.91-4.87-9.5-5.79-12.42-1.13-3.59-2.05-4.24-2.81-2.01-.63 1.82-2.13-1.01-3.33-6.31-3.56-15.58 1.03-44.75 8.74-55.55 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-11.03-2.44-12.08-6.11-5.44-19 6.31-12.23 16.21-21.14 20.75-18.65 2.55 1.4 2.8 1.2 1.22-1-1.09-1.51-.57-3.91 1.16-5.32 5.94-4.86 14.47 8.35 12.75 19.72-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.65-2.99 38.13-.77 37.85 2.44-.14 1.62-3.71 2.47-7.95 1.9-4.24-.58-13.06-.86-19.61-.63-10.9.37-11.95.92-12.5 6.49-.33 3.34-.15 5.7.42 5.24.56-.46 3.18-1.56 5.82-2.43 3.27-1.08 3.68-1.97 1.28-2.8-1.93-.66-2.52-2.02-1.3-3.02s2.99-.87 3.93.28 3.23.84 5.09-.68c2.22-1.81 4.1-1.2 5.46 1.75 1.3 2.83 6.82 4.97 14.74 5.7 12.84 1.19 15.58-1.16 3.48-2.98-3.63-.54-5.58-1.82-4.33-2.84 3.14-2.57 19.76 1.41 20.22 4.85.2 1.54 3.13 3.08 6.5 3.41 3.37.34 5.97 1.73 5.78 3.1-.2 1.37-1.74 1.66-3.44.64-1.7-1.03-3.52-.63-4.04.89-.52 1.51-2.53.81-4.47-1.56-1.99-2.44-4.89-3.19-6.66-1.74-1.73 1.41-4.04 1.47-5.14.13-1.1-1.34-2.08-1.54-2.19-.43-.11 1.1 2.68 3.66 6.2 5.68 4.92 2.83 5.92 4.52 4.33 7.31-1.43 2.51-3.28 2.15-6-1.17-3.49-4.27-18.98-7.66-22.36-4.9-.71.59 1.79 3.8 5.56 7.13 5.79 5.12 6.54 7.56 4.75 15.63l-2.12 9.57 9.16-.52c10.72-.61 15.6 4.12 14.16 13.7-1 6.63 2.68 19.03 4.27 14.4.43-1.25 3.88-.76 7.67 1.11 7.15 3.51 12.29 12.13 8.89 14.92-6.16 5.04-9.56 13.73-6.61 16.89 1.69 1.82 1.97 1.55 1.16-1.07-1.71-5.45 2.38-7.06 6.17-2.44 1.88 2.31 4.37 3.42 5.52 2.48 4.33-3.55 7.01 4.82 5.57 17.43-1.54 13.42.44 16.08 7.59 10.21 3.4-2.78 4.09-2.45 4.06 1.92-.03 4.31.57 4.78 3.31 2.54 2.63-2.16 4.2-1.11 7.42 4.94 2.67 5.03 4.46 6.61 5.16 4.57 1.55-4.51-4.45-14.44-10.34-17.13-4.49-2.04-4.32-2.15 1.53-.92 3.63.76 5.68.26 4.56-1.11s-.99-3.35.29-4.4c1.41-1.15 2.69 1.39 3.22 6.38.48 4.56 2.41 9.17 4.29 10.24 1.87 1.07 2.61 3.21 1.63 4.75-.98 1.55.76 1.66 3.86.23 4.88-2.24 4.94-3.1.42-6.46-2.87-2.13-5.63-6.14-6.12-8.9-.63-3.55 1.34-2.06 6.69 5.06 6.51 8.66 7.27 11.9 5.37 22.94-2.54 14.79-1.27 17.27 9.06 17.78 5.13.26 8.35 2.2 10.22 6.16 1.5 3.19 3.67 5 4.85 4.03 1.17-.96.86-3.45-.7-5.54-1.56-2.08-1.47-3.05.2-2.14 1.67.9 3.87 5.39 4.88 9.97 2.21 9.96 6.57 13.2 11.88 8.86 2.14-1.75 5.18-2.74 6.76-2.2 1.58.55 3.82-.67 4.98-2.7 1.16-2.03 3.01-2.6 4.11-1.26 1.09 1.35.33 2.66-1.69 2.93-2.47.33-2.33 1.27.42 2.84 2.25 1.28 3.61 3.76 3.02 5.49-.6 1.74 1.2 5.07 3.99 7.41 7.12 5.94 4.85 9.8-2.53 4.31-4.44-3.29-5.66-6.01-4.57-10.21.81-3.14.36-4.79-1.01-3.67s-3.93.46-5.68-1.47c-1.75-1.93-1.47.47.62 5.33s5.66 10.19 7.93 11.84c2.28 1.65 3.71 4.26 3.18 5.78-.52 1.53.33 3.21 1.9 3.75 1.56.54 3.28-.28 3.81-1.82 1.74-5.08 2.29-1.32 1.12 7.65-1.04 7.9-1.46 8.4-3.98 4.74-2.13-3.09-3.89-2.93-7.19.64-2.77 3-4.53 3.49-4.82 1.33-.58-4.34-3.39-2.02-5.11 4.21-.99 3.61-.46 4.52 2.16 3.71 4.84-1.5 10.73 6.38 7.04 9.41-1.66 1.35-2.84 3.79-2.62 5.41.24 1.8 2.23.29 5.12-3.88 3.77-5.45 4.99-6.05 6-2.97.71 2.13.11 4.02-1.32 4.21-1.43.19-2.41 1.81-2.17 3.6.24 1.79-.88 3.43-2.5 3.65-4 .53-2.71 1.69 6.11 5.48 4.13 1.77 7.29 2.11 7.03.75-.26-1.36.1-1.38.81-.03 2.89 5.5 12.45 8.85 14.58 5.12 1.63-2.86.87-4.37-3.01-5.98-6.67-2.77-9.41-6.15-6.75-8.33 1.15-.94 3.25-.29 4.67 1.45 3.49 4.26 26.38 15.05 28.41 13.39 2.88-2.36-3.4-12.58-7.55-12.3-2.87.19-2.91-.22-.17-1.43 2.12-.94 5.71.57 7.98 3.34 2.39 2.92 5.05 3.92 6.31 2.38 1.21-1.46 3.39-1.19 4.86.6 1.47 1.79 3.14 1.91 3.7.26.57-1.66 1.77-2.11 2.67-1.02.89 1.1.59 3.81-.67 6.03-1.27 2.22-.68 4.96 1.32 6.1 2.28 1.3 2.3 2.5.05 3.25-2.13.7-4.88-1.21-6.79-4.75-1.82-3.34-4.21-5.11-5.49-4.06-1.25 1.02-.66 2.77 1.31 3.9 3.52 2 1.52 11.07-3.04 13.76-1.27.76-1.29 3.28-.03 5.61 2.81 5.2 6.29 2.78 7.06-4.9 1.18-11.89 5.87-8.43 5.83 4.3-.02 4.63-.06 10.34-.09 12.69-.09 6.2 1.83 7.68 10.26 7.87 9.26.2 11.34-6.77 2.29-7.67-6.25-.62-13.56-7.14-8.73-7.79 1.54-.2 2.42-3.97 1.95-8.36-.72-6.82.04-8.11 5.21-8.77 7.75-1 8.62 3.9.96 5.41-4.8.95-5.06 1.54-1.53 3.56 2.34 1.33 2.95 2.6 1.37 2.82-1.59.23-3.04 2.97-3.23 6.11-.31 5.08.17 4.97 4.45-.96 2.65-3.66 5.95-7.66 7.35-8.89 1.4-1.22 1.95-2.95 1.23-3.83-.73-.88-2.41-4.86-3.74-8.83-2.02-6.04-1.58-7.15 2.69-6.72 12.84 1.28 17.37 5.18 19.4 16.7 2 11.34 6.25 17.26 12.19 16.95 2.12-.12 2.47.56.94 1.84-1.32 1.11-7.16 1.13-12.98.04-8.95-1.68-10.96-1.1-12.97 3.75-1.3 3.15-1.2 7.16.24 8.92 1.43 1.75 3.04 1.92 3.57.39.53-1.54 5.48-3.91 11-5.27 8.84-2.18 10.85-1.51 16.78 5.53 4.08 4.84 5.77 8.82 4.28 10.07-1.46 1.23-.52 1.85 2.34 1.52 3.2-.36 3.94.19 2.21 1.63-1.42 1.2-1.5 3.5-.18 5.12 1.56 1.91 3.56 1.36 5.68-1.55 1.8-2.47 1.86-4.98.14-5.57-1.94-.67-1.57-1.28.99-1.63 3.26-.43 3.83.55 2.74 4.76-.76 2.92-.17 5.42 1.31 5.57 1.48.15 2.02 2.28 1.2 4.73-1.1 3.3-.76 3.89 1.28 2.26 1.52-1.22 2.95-.79 3.18.94.24 1.73 1.42 2.33 2.64 1.33 1.22-.99 1.27-3 .11-4.45-1.58-1.98-1.09-2.3 1.94-1.3 3.26 1.08 3.77.49 2.61-3.01-.79-2.4-2.37-3.6-3.5-2.67-1.13.93-4-1.09-6.37-4.49-2.38-3.39-5.83-6.69-7.68-7.32-1.84-.64-2.31-2.97-1.05-5.2 1.6-2.81 2.7-2.84 3.6-.11 1.72 5.17 7.77 3.05 8.16-2.86.22-3.42-.81-4.73-3.97-5.04-2.54-.25-3.43-1.12-2.19-2.14 3.86-3.16 11.18-.85 16.02 5.05 2.64 3.22 5.7 5.12 6.81 4.21 1.11-.91 4.63-.57 7.82.75 4.66 1.93 6.26 5.02 8.17 15.78 2.58 14.45 4.77 15.38 15.51 6.59 7.54-6.18 17.66-1.78 27.3 11.87 4.47 6.34 8.9 10.9 9.84 10.13.94-.77-.16-8.52-2.44-17.22-2.29-8.7-3.05-16.72-1.69-17.83 1.82-1.49 2.45-.79 2.43 2.7-.02 2.59 1.3 4.91 2.92 5.15 1.62.25 1.22.73-.89 1.08-2.7.45-2.4 2.39.99 6.49 3.31 3.99 4.68 4.5 4.33 1.61-.42-3.46.18-3.85 3.22-2.11 5.95 3.39 8.95 12.27 4.64 13.7-2.11.7-4.08-.34-4.37-2.3-.29-1.96-1.06-.97-1.71 2.2-.65 3.17-.15 7.03 1.12 8.58 1.34 1.65.58 3.39-1.82 4.18-2.66.88-3.1 2.62-1.23 4.9 3.86 4.72 7.08-.83 5.24-9.05-1.29-5.75-.94-6.27 2.79-4.15 4 2.28 4.32 2.02 5.27-4.33.62-4.13-1.08-8.99-4.38-12.5-2.97-3.15-4.59-7.15-3.6-8.89 1.17-2.05 2.31-1.6 3.27 1.28.97 2.95 1.87 3.26 2.67.93 1.84-5.35 5.29 6.79 6.91 24.35.77 8.2 1.69 15.29 2.06 15.74.37.45 3.24-1.33 6.36-3.97 7.25-6.11 14.25-.52 12.94 10.35-1.59 13.13-1.69 14.99-1.28 24.51.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.94-13.85-7-14.29-20.99-2.26-11.94 10.27-44.02 23.6-47.26 19.64-.73-.88-2.73-.45-4.46.96-1.72 1.42-4.17 1.31-5.44-.24-1.26-1.55-5.47-2.97-9.34-3.16-3.87-.19-7.57-1.96-8.22-3.94-.65-1.97-2.7-3.38-4.55-3.13-1.85.24-2.45 1.57-1.32 2.94 1.12 1.37-1.8 1.65-6.5.6-6.6-1.46-9.01-3.37-10.59-8.39-2.01-6.38 1.35-4.91 6 2.63 1.43 2.33 2.27 2.22 2.53-.33.55-5.27-10.62-14.01-14.17-11.1-2.89 2.36-1.76 5.51 3.87 10.8 5.57 5.23-6.91 1.81-22.38-6.13-7.93-4.07-20.37-9.29-27.64-11.6-14.56-4.63-20.19-8.82-10.56-7.86 3.39.33 6.22-.52 6.31-1.9.08-1.38-1.38-1.97-3.24-1.31-1.85.67-4.55-.22-5.98-1.98-1.66-2.02-3.43-1.76-4.84.72-1.28 2.24-2.4 2.57-2.64.79-.23-1.71-1.41-2.3-2.63-1.3-1.22 1-4.32-.79-6.89-3.97-3.78-4.66-3.76-5.52.12-4.46 3.67 1 3.32.07-1.5-4.01-5.75-4.86-5.76-5.09-.15-2.58 3.38 1.51 8.35 1.87 11.04.8 2.7-1.07 5.62-1.07 6.5 0 .87 1.08 2.69 1.05 4.03-.05 1.34-1.09 1.15-2.12-.42-2.27-1.58-.15-.16-4.33 3.15-9.3l6.02-9.03-11.89 9.47c-11.14 8.87-12.44 9.23-20.31 5.58l-8.41-3.89 3.24 6.88c3.71 7.88.31 8.13-11.28.83-5.18-3.27-8.44-6.98-9.11-10.35-.69-3.48-2.52-5.41-5.42-5.7-3.32-.33-3.52-1.15-.83-3.34 1.95-1.61 4.71-1.5 6.12.22 1.41 1.73 3.51 2.37 4.66 1.43 3.3-2.7-2.7-8.27-7.28-6.76-2.26.75-5.24 0-6.61-1.67-1.36-1.67-2.95-1.68-3.52-.03-.56 1.65-1.89 1.95-2.94.67-1.06-1.29-2.43-.85-3.06.98-.82 2.38-.04 3.18 2.71 2.82 2.57-.35 4.15 1.15 4.74 4.5.7 3.92-1.6 3.18-10.47-3.33-8.92-6.56-11.36-9.46-11.33-13.49.03-4.11-.85-4.84-4.4-3.66-5.22 1.73-9.73-2.73-7.05-6.98 1.45-2.29.39-3.66-4.71-6.04l-6.58-3.07 4.01 5.45c3.66 4.98 3.56 5.21-1.11 2.65-10.39-5.7-19.9-14.38-16.26-14.86 1.91-.26 5.27 1.52 7.45 3.94 3 3.34 3.12 2.27.48-4.4-2.77-7.01-4.39-8.68-7.96-8.21-2.68.35-4.09 1.63-3.51 3.19 1.18 3.2-4.12 4.21-6.54 1.25-1.05-1.28 1.2-3.63 5.65-5.89 8.45-4.3 7.51-7.54-2.01-6.96-3.56.22-6.61-.66-6.79-1.96-.17-1.29-1.75-2.16-3.51-1.93-1.81.24-1.51 2.55.69 5.31 3.54 4.44 3.41 4.7-1.42 2.9-3.76-1.41-7.02-5.52-11.16-14.08-4.66-9.64-7.19-12.58-12.45-14.5-5.22-1.9-6.22-3.06-4.76-5.5 1.01-1.69 1.09-4 .17-5.12-.92-1.13-2.14-.69-2.71.96-1.8 5.26-3.6.2-3.01-8.49l.57-8.37-6.89 3.24c-4.68 2.21-6.72 4.67-6.36 7.65.43 3.5-.08 3.66-2.49.77-2.67-3.21.64-8.71 7.75-12.87 2.64-1.55-2.67-7.14-6.31-6.65-1.74.23-2.24 1.53-1.13 2.89 1.51 1.85.81 2.46-2.76 2.44-2.62-.02-6.18-2.62-7.9-5.79-1.72-3.17-5.93-6.92-9.35-8.34-7.35-3.05-7.7-6.06-.96-8.29 3.82-1.26 4.56-.75 3.46 2.42-1.04 3.04-.04 4.52 4.09 6.07 5.92 2.22 5.91 2.2-3.13-10.42-1.38-1.93-2.5-5.98-2.49-9.01.02-3.71-1.06-5.37-3.28-5.08-1.82.25-2.56 1.35-1.65 2.46 2.64 3.22-8.52 7.13-12.93 4.53-2.2-1.3-5.58-2.22-7.5-2.06-2.11.18-2.06-.9.13-2.72a4.91 4.91 0 0 1 6.8.49c1.98 2.22 2.74 2.2 2.04-.04-1.29-4.11-10.77-6.66-11.95-3.22-1.38 4.01-16.34-9.65-18.65-17.03zm9.72 8.64c3.69-3.02 4.6-8.72 1.67-10.39-5.38-3.07-9.88 2.15-5.97 6.92 1.88 2.3 3.82 3.86 4.3 3.47zm-26-45.1c2.54-2.08 4.36-.77 8.51 6.14 6 9.98 5.74 7.51-.68-6.47-2.8-6.09-4.75-8.5-5.39-6.64-.55 1.59-3.3 2.89-6.11 2.87-4.13-.03-4.58.62-2.34 3.36 1.53 1.86 4.23 2.2 6.01.74zm23.12 17.76c.56-1.65.1-4.11-1.04-5.47-1.25-1.48-1.86-.55-1.53 2.33.69 6.15 1.28 6.87 2.57 3.14zm-23.09-31.1c-.63-2.01-2.18-3.75-3.44-3.88-1.27-.12-.75 1.52 1.15 3.65 2.09 2.35 2.99 2.44 2.29.23zm-19.83-29.84c1.15-.94.94-3.13-.47-4.85-1.42-1.73-3.51-2.37-4.66-1.43-1.15.95-.94 3.13.47 4.85 1.42 1.73 3.51 2.37 4.66 1.43zm-9.98-16.29c2.83-2.31-3.01-12.22-8.56-14.52-4-1.66-4.46-2.76-1.99-4.79 2.05-1.67 1.63-4.56-1.17-7.98-2.53-3.09-4.83-4.06-5.43-2.29-.58 1.68.06 3.43 1.43 3.9 1.36.47 1.68 2.27.7 3.99-1.96 3.43 12.26 23.96 15.02 21.69zm44.61 54.32c1.15-.95.94-3.13-.47-4.85-1.42-1.73-3.51-2.37-4.66-1.43-1.15.94-.94 3.13.47 4.85 1.42 1.73 3.51 2.37 4.66 1.43zm-16.74-24.72c1.15-.95 1.32-2.66.38-3.81a2.721 2.721 0 0 0-3.81-.38 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm48.24 58.6c-1.14-3.71-3.48-6.89-5.19-7.06-1.71-.17-.78 2.87 2.08 6.75 4.89 6.64 5.08 6.66 3.11.31zm120.11 138.73c3.53 1.17 4.55.45 5.37-3.76.9-4.62.28-5.29-5.48-5.96-9.01-1.04-8.92 6.72.11 9.72zM6.517 96.38c1.22-2.13 1.4-3.96.4-4.06-1-.1-2.31 1.26-2.91 3.03-1.65 4.79-.02 5.47 2.51 1.03zm68.87 84.49c1.68-1.37 1.9-2.89.49-3.37-1.4-.49-2.98.38-3.51 1.92-1.35 3.93-.5 4.33 3.02 1.45zm137.33 160.05c.96-1.75-.6-1.26-3.48 1.09-2.88 2.36-3.66 3.79-1.75 3.2 1.91-.6 4.27-2.53 5.23-4.29zm34.26 47.46c6.37-2.93 3.92-10.83-3.42-11.02-3.01-.08-3.61.21-1.33.66 6.46 1.26 7.14 3.67 1.85 6.54-6.22 3.36-3.61 6.8 2.9 3.82zM98.917 204.69c.45-.37-.33-2.08-1.74-3.81-1.42-1.72-3.49-2.39-4.6-1.48-1.11.91-.33 2.63 1.75 3.81 2.07 1.19 4.14 1.85 4.59 1.48zm103.2 128.62c1.15-.94 1.32-2.65.38-3.8a2.72 2.72 0 0 0-3.81-.38 2.71 2.71 0 0 0-.37 3.81 2.698 2.698 0 0 0 3.8.37zm-48.62-76.98c3.67-3 3.54-3.4-1.04-3.15-2.88.16-6.16-.84-7.29-2.22-1.13-1.38-2.48-1.28-2.99.21-1.65 4.8 6.97 8.72 11.32 5.16zM15.937 86.52c1.21 3.66 1.57 3.47 2.51-1.36.62-3.22-.11-5.17-1.71-4.56-1.55.59-3.41-.74-4.14-2.94-1.03-3.12-.23-4.01 3.61-3.99 3.97.03 4.13-.43.81-2.32-5.12-2.92-5.33-2.74-8.5 7.33-2.16 6.88-1.89 7.84 1.71 5.89 2.75-1.49 4.8-.79 5.71 1.95zm87.99 114.07c1.15-.94 1.32-2.65.38-3.8a2.721 2.721 0 0 0-3.81-.38 2.708 2.708 0 0 0-.38 3.8c.94 1.15 2.66 1.33 3.81.38zm68.03 78.75c.54-3.6 3.44-8.04 6.43-9.86 4.32-2.62 6.18-2.1 9 2.53 1.95 3.2 3.7 4.42 3.89 2.72.42-3.89-17.37-26.63-19.48-24.9-.85.7-3.37.01-5.6-1.52-2.24-1.54-1.07.57 2.59 4.67 3.66 4.11 6.53 8.7 6.38 10.21-.15 1.51-3.61-1.34-7.7-6.32-4.08-4.99-7.52-8.01-7.65-6.71-.13 1.29 3.05 6.42 7.07 11.39 4.01 4.97 5.32 7.51 2.89 5.66-5.46-4.2-11.58-3.67-10.97.94.26 1.9 3.1 6.67 6.32 10.6 5.54 6.77 5.9 6.8 6.83.59zm107.7 133.73c4.46.03 4.55-.84.56-5.7-3.98-4.87-4.85-4.96-5.7-.57-.55 2.84-.81 5.41-.57 5.7.24.3 2.81.55 5.71.57zm-217-269.53c.51-.41.15-1.69-.79-2.84-.94-1.15-2.71-1.28-3.93-.28-1.22 1-.86 2.28.79 2.85 1.66.56 3.42.69 3.93.27zm27.61 26.26c.95-.75.37-1.82-1.29-2.39-1.65-.57-1.53-2.24.26-3.7 3.81-3.13 1.64-6.82-3.6-6.13-2.12.29-2.32.94-.49 1.57 1.77.61 1.19 3.72-1.32 7.11-3.51 4.72-3.48 5.9.13 5.45 2.52-.31 5.37-1.17 6.31-1.91zm114.6 145.54c.57-1.65.31-3.89-.58-4.97-.88-1.09-2.55-1.2-3.7-.26-1.15.94-.89 3.18.58 4.97 1.47 1.8 3.13 1.91 3.7.26zm57.48 71.73c3.34 1.91 4.08 1.54 3.67-1.84-.76-6.27-2.64-7.75-6.16-4.86-3.54 2.9-3.36 3.37 2.49 6.7zM106.507 179.7c7.72-3.64 14.52-.83 22.05 9.11 4.7 6.21 5.04 8.19 1.61 9.55-2.38.95-4.95 4.69-5.72 8.32-1.34 6.3-1.27 6.31 1.53.22 3.82-8.27 7.41-7.8 6.98.91-.3 6.07.15 6.7 3.9 5.45 2.33-.77 5.68.22 7.44 2.21 2.78 3.13 2.97 2.88 1.46-1.96-.97-3.12-3.54-5.95-5.82-6.44-5.78-1.24-5.93-7.59-.24-10.2 5.6-2.57 5.32-3.29-2.24-5.85-6.6-2.24-10.36-11-5.02-11.71 2.27-.3 2.34-.94.19-1.68-1.91-.65-2.55-1.95-1.42-2.87 1.13-.93 2.97-6.54 4.08-12.47 1.55-8.27.95-10.99-2.56-11.67-2.52-.49-5.5.72-6.63 2.7-1.49 2.61-3.43 1.89-7.16-2.67-4.08-4.97-6.34-5.59-11.05-3.04-3.33 1.81-5.45 4.66-4.84 6.51.73 2.2 2.55 1.54 5.5-1.99 4.02-4.82 4.81-4.66 9.03 1.76 3.24 4.93 6.7 7.02 11.5 6.96 6.68-.09 6.69-.01.58 2.9-4.24 2.02-4.86 2.88-1.91 2.64 3.65-.28 4.06.22 2.46 3.01-2.57 4.52-6.34 6.73-7.27 4.27-.42-1.1-1.97-1.06-3.44.08-4.04 3.13-18.98 2.34-19.43-1.04-.31-2.29-4.17.5-6.92 4.99-.18.3 1.39 1.51 3.47 2.7 2.09 1.19 6.54.87 9.89-.7zm-31.63-43.44c.72-3.66.1-4.48-3.08-4.06-2.19.3-4.39 2.6-4.88 5.12-.71 3.67-.09 4.49 3.09 4.06 2.19-.29 4.38-2.59 4.87-5.12zm231.98 292.97c1.73-1.41 2.39-3.48 1.48-4.6-.91-1.11-2.63-.32-3.81 1.75-1.18 2.08-1.85 4.14-1.48 4.6.37.45 2.09-.34 3.81-1.75zm-137.11-185.54c2.93.66 5.41.35 5.51-.69.43-4.28-15.56-3.93-17.97.39-2.22 3.97-1.99 4.15 2.33 1.76 2.65-1.47 7.2-2.12 10.13-1.46zm45.4 72.84c-.6-1.91-2.53-4.26-4.28-5.23-1.76-.96-1.27.61 1.08 3.48 2.36 2.88 3.8 3.66 3.2 1.75zm-10.1-29c2.07 4.4 3.74 5.39 5.98 3.55 1.91-1.56 3.64-.95 4.48 1.57 1.72 5.21 4.04 3.44 4.74-3.63.71-7.07-1.71-9.82-7.07-8.04-5.36 1.77-11.39-7.43-7.99-12.19 2.17-3.03 2.3-2.88 1.15 1.41-1.1 4.11-.63 4.74 3.21 4.3 5.72-.65 9.07-6.37 5.96-10.17-1.37-1.68-.33-4.48 2.46-6.6 2.66-2.03 4.05-2.25 3.09-.5-.97 1.76-.28 5 1.53 7.21 1.83 2.24 1.84 5.19.02 6.68-1.79 1.47-1.97 3.11-.39 3.66 1.58.54 3.87-.75 5.07-2.87 1.32-2.3 4.92-3.09 8.97-1.95 3.73 1.05 7.89.97 9.25-.17 1.63-1.38.98-1.9-1.91-1.55-2.41.3-4.59-1.04-4.85-2.96-.25-1.93-1.71-2.51-3.23-1.3-2.18 1.75-2.47 1.34-1.38-1.95 1.11-3.36.27-3.98-4.39-3.23-5.27.85-5.46.66-2.17-2.13 1.99-1.68 3.29-3.45 2.89-3.93-.39-.49-1.43-3.04-2.3-5.68-.9-2.71-2.01-3.58-2.55-1.99-.53 1.54-4.18 3.43-8.1 4.21-4.6.9-6.72.19-5.97-2.01.65-1.87 1.99-2.41 2.99-1.19 1 1.21 3.87.4 6.38-1.81 2.96-2.6 3.14-3.5.52-2.57-2.23.8-6.22.99-8.85.43-3.88-.83-5.46.31-8.22 5.93-2.53 5.15-2.3 7.17.9 7.79 3 .59 3.99 1.81 3.24 4.02-.6 1.74-3.02 2.07-5.38.72-3.97-2.26-4.26-1.99-3.95 3.68.19 3.37-.34 5.3-1.17 4.28-.84-1.01-1.4 1.12-1.26 4.73.14 3.62-.45 5.78-1.31 4.81-.86-.98-2.07.8-2.69 3.95-1.04 5.23-.68 5.45 4.15 2.55 4.3-2.58 5.81-2.03 8.15 2.94zm-47.09-50.82c1.15-.94 1.32-2.65.38-3.8a2.721 2.721 0 0 0-3.81-.38 2.708 2.708 0 0 0-.38 3.8 2.72 2.72 0 0 0 3.81.38zm162.58 186.92c.13-1.26-1.51-.75-3.64 1.15-2.35 2.09-2.44 3-.23 2.3 2.01-.64 3.75-2.19 3.87-3.45zM96.497 147.92c.27-2.73-.41-3.8-1.72-2.73-2.79 2.29-3.24 6.79-.7 7.04 1.08.11 2.17-1.83 2.42-4.31zm62.93 78.06c2.82-1.3 4.38-3.86 3.66-6.03-.77-2.33.63-4.41 3.64-5.43 4.23-1.44 4.14-1.82-.67-2.8-5.66-1.16-11.03 4.34-7.93 8.13.94 1.15-.15 2.71-2.41 3.46-2.27.75-3.47 2.16-2.67 3.14.8.98 3.67.77 6.38-.47zm99.75 119.45c-.12 1.26-2.24 1.62-4.69.8-3.82-1.26-4.07-.98-1.71 1.95 1.51 1.89 5.12 3.45 8.02 3.47 4.32.02 4.77-.58 2.49-3.36-3.1-3.79-2.87-4.22 3.32-6.27 2.39-.79 5.42-.13 6.74 1.48 1.31 1.6 3.32 2.14 4.47 1.2 4.19-3.43-2.68-7.27-9.67-5.42-3.95 1.05-8.27.57-9.6-1.06-2.55-3.11-9.99-1.9-10.34 1.69-.12 1.15 2.35 2.35 5.49 2.66 3.14.31 5.61 1.6 5.48 2.86zM48.187 92.51c.43-.36.73-3.36.66-6.66-.11-5.45-.25-5.46-1.44-.14-1.24 5.58-.94 8.21.78 6.8zm42.69 47.76c1.19-2.09 3.77-2.24 6.37-.35 2.4 1.75 5.3 2.4 6.45 1.46 1.31-1.07-.34-2.87-4.44-4.82-6.11-2.9-15.31 1.24-11.93 5.37.85 1.03 2.44.28 3.55-1.66zm75.06 93.39c1.15-.94 1.28-2.71.28-3.92-1-1.22-2.28-.87-2.84.79-.57 1.65-.7 3.42-.28 3.92.41.51 1.69.16 2.84-.79zm170.1 206.67c2.05-1.64 2.37-1.29 1.42 1.59-.92 2.79 1.15 4.54 8.36 7.08 5.27 1.85 10.61 2.53 11.86 1.51 1.24-1.02-.42-2.13-3.71-2.46-7.73-.76-8.43-1.82-2.74-4.1 4.27-1.71 4.15-1.85-1.68-1.85-3.45-.01-9.8-3.13-14.1-6.93-6.34-5.6-7.5-5.89-6.08-1.51 2.55 7.86 3.72 9.03 6.67 6.67zM10.917 42.66c.45-.37.21-2.53-.54-4.79-.75-2.27-2.28-3.38-3.39-2.47-1.12.91-.87 3.07.54 4.8 1.41 1.72 2.94 2.83 3.39 2.46zm14.67 10.28c.74-2.19 2.45-5.2 3.8-6.7 3.8-4.21 3.33-7.45-.62-4.22-3.79 3.1-8.43 14.5-6 14.74.81.08 2.08-1.64 2.82-3.82zm235.39 283.99c1.1 1.35 2.95 1.68 4.1.73 2.59-2.12.82-4.34-5.02-6.28-2.91-.97-4.06-2.67-3.31-4.87 2.09-6.06-2.99-11.02-7.49-7.33-2.9 2.37-3.04 4.13-.45 5.6 2.4 1.37 2.53 3.17.37 4.94-3.11 2.54-2.84 2.86 3.2 3.77 3.63.54 7.5 2.09 8.6 3.44zM33.187 53.41c2.67-3.2 4.21-6.6 3.43-7.56-.79-.95-3.48 1.62-5.99 5.71-5.47 8.94-4.15 9.9 2.56 1.85zm40.18 58.66c.56-1.66.69-3.42.27-3.93-.41-.51-1.69-.15-2.84.79-1.15.94-1.28 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm254.81 311.68c1.54-.2 1.72-2.71.41-5.56-1.96-4.27-2.56-4.32-3.34-.3-1.11 5.74-.8 6.36 2.93 5.86zm-212.82-263.31c-.63-2-2.18-3.75-3.45-3.87-1.26-.13-.74 1.51 1.15 3.64 2.1 2.36 3 2.45 2.3.23zm56.98 63.1c-1.08-6.09-7.74-9.18-6.95-3.21.29 2.19 2.17 4.92 4.18 6.06 3.07 1.76 3.51 1.31 2.77-2.85zm13.54 14.77c4.02-3.3 1.24-5.85-6.81-6.24-6.49-.32-6.55-.14-1.44 4.13 2.94 2.46 6.65 3.41 8.25 2.11zM14.297 30.92c.63-1.84 2.99-2.71 5.25-1.93 2.98 1.02 3.03.29.19-2.69-2.78-2.92-4.76-2.94-6.86-.04-1.63 2.23-2.23 4.95-1.34 6.03.88 1.08 2.13.47 2.76-1.37zm146.99 159.51c.42-4.25-6.05-2.74-10.34 2.42l-4.88 5.88 7.53-3.39c4.15-1.86 7.6-4.07 7.69-4.91zm-4.76 12.44c.57-2.89.24-5.34-.72-5.43-2.63-.26-4.19 5.93-2.12 8.46 1.14 1.39 2.21.24 2.84-3.03zm212.61 251.2c.9-6.04-5.04-7.01-8.27-1.36-1.92 3.38-1.4 4.42 2.58 5.2 3.92.76 5.13-.06 5.69-3.84zM83.807 100.43c.26-2.63-11.39-6.8-13.71-4.9-1.14.93 1.45 2.79 5.74 4.14 4.29 1.35 7.88 1.69 7.97.76zm65.19 91.21c1.15-.95 1.28-2.71.28-3.93-1-1.22-2.28-.86-2.85.79-.57 1.65-.69 3.42-.28 3.93.42.5 1.7.15 2.85-.79zm192.76 217.28c2.49.77 3.35-.31 2.97-3.71-.35-3.09-1.47-4.45-3.14-3.83-3.71 1.37-13.07-10.85-10.15-13.24 1.35-1.1 1.66-2.08.69-2.18-3.11-.31-9.05 9.72-6.31 10.66 1.46.5 4.56 2.5 6.89 4.44 3.15 2.63 3.11 4.56-.15 7.53-4.07 3.71-4.02 3.83.65 1.62 2.77-1.31 6.62-1.89 8.55-1.29zm-165.46-192.47c.57-1.66.7-3.42.28-3.93-.41-.51-1.7-.15-2.85.79-1.15.94-1.27 2.71-.27 3.93.99 1.22 2.28.86 2.84-.79zm12.92 14.92c2.51.25 3.84 1.05 2.96 1.78-.89.73.95 1.58 4.09 1.89 6.43.64 11.02-2.09 8.56-5.09-.9-1.09-3.49-1.72-5.77-1.39-5.24.75-13.5-3.97-10.8-6.18 1.11-.91 3.39-.02 5.05 1.98 2.57 3.07 2.94 2.91 2.45-1.09-.42-3.44-2.21-4.41-6.56-3.55-3.29.65-5.86-.02-5.71-1.48.14-1.46-.76-1.82-2-.8-4.42 3.62.93 13.25 7.73 13.93zm133.11 159.94c1.94-.74 1.63-2.08-.82-3.48-2.19-1.25-4.91-1.52-6.03-.6-2.75 2.25 2.87 5.6 6.85 4.08zm-203.97-258.43c4.59-3.76 5.46-6.11 3.24-8.77-2.42-2.91-2.92-2.75-2.49.79.3 2.44-1.31 5.05-3.59 5.8-3.63 1.21-5.68 4.58-4.01 6.62.31.38 3.4-1.62 6.85-4.44zm-82.59-96.59c1.15-.94.73-3.35-.93-5.35-2.59-3.1-2.95-2.94-2.49 1.16.68 6.04.87 6.28 3.42 4.19zm10.32 1.93c1.15-.95-.07-1.47-2.71-1.17-2.64.29-5.74 1.31-6.89 2.25-1.15.94.07 1.47 2.71 1.17 2.64-.3 5.74-1.31 6.89-2.25zm268.19 331.58c1.16 3.5 1.59 3.35 2.4-.82.8-4.09-.15-5.49-4.79-7.06-6.69-2.26-9.12-1.04-7.36 3.71.68 1.84 2.83 2.58 4.79 1.63 2.06-1.01 4.14.06 4.96 2.54zm-213.12-257.78c1.12-.92.33-2.63-1.74-3.81-2.08-1.19-4.14-1.85-4.6-1.48-.45.37.34 2.08 1.75 3.81 1.41 1.72 3.48 2.39 4.59 1.48zm-68.91-88.57c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.95-1.27 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm6.1-3.32c.56-2.89.14-5.34-.94-5.45-1.08-.11-1.97-2.6-1.99-5.53-.02-4.31-.3-4.58-1.43-1.41-.77 2.16-.56 6.61.46 9.9 2.6 8.31 2.75 8.41 3.9 2.49zm301.59 366.29c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.95-1.28 2.71-.28 3.93 1 1.22 2.28.87 2.85-.79zm33.67 38.53c2.19 1.25 5.57.96 7.52-.63 1.94-1.59 5.59-2.69 8.1-2.44 2.54.25 3.81-.48 2.86-1.64-.95-1.15-3.77-2.3-6.28-2.55-3.29-.33-3.9-1-2.18-2.41 1.31-1.07 3.74-1.49 5.39-.92 1.65.57 5.01-.73 7.45-2.88 2.45-2.16 2.89-3.43.97-2.83-1.91.59-4.57-.25-5.9-1.88-1.34-1.63-4.23-1.49-6.44.32s-5.98 3.94-8.39 4.74c-3.21 1.06-3.29 2.07-.33 3.76 5.39 3.07 2.4 5.22-4.84 3.48-6.02-1.44-4.82 1.95 2.07 5.88zm-40.62-55.55c1.15-.94 1.32-2.65.38-3.8a2.72 2.72 0 0 0-3.81-.38 2.698 2.698 0 0 0-.37 3.8 2.708 2.708 0 0 0 3.8.38zm11.42 7.24c-.87-4.56-.52-9.18.79-10.25 1.3-1.06 1.4-2.04.2-2.15-4.15-.42-6.42 12.47-2.92 16.58 2.98 3.49 3.28 2.85 1.93-4.18zm80.44 97.12c1.44-.19 1.53-1.68.2-3.3-1.33-1.63-2.8-1.83-3.28-.45-.47 1.38-.56 2.86-.2 3.3.36.44 1.83.64 3.28.45zm-48.9-67.66c3.74-4.09 2.3-8.89-3.66-12.22-3.59-2.01-3.94-.94-2.01 6.13 1.29 4.71 2.39 8.78 2.45 9.04.06.26 1.51-1.06 3.22-2.95zm-24.37-33.19c1.19-2.08 1.85-4.14 1.48-4.6-.37-.45-2.08.34-3.81 1.75-1.72 1.41-2.39 3.48-1.48 4.6.92 1.11 2.63.32 3.81-1.75zm14.82 11.69c.97 1.19-.15 2.8-2.5 3.58-2.59.86-3.02 1.84-1.09 2.5 1.75.6 4.04-.42 5.09-2.26 1.06-1.85 3.29-2.61 4.98-1.69 1.68.91 1.48-.42-.45-2.96-3.37-4.43-9.72-4.21-14.44.51-1.24 1.23-.25 1.32 2.2.2 2.44-1.12 5.24-1.07 6.21.12zm60.66 79.42c5.45-.12 5.46-.25.14-1.44-5.58-1.24-8.21-.95-6.8.78.36.43 3.35.73 6.66.66zm-96.89-117.77c.29-2.88 10.04-2.16 12.58.94 1.01 1.23 2.78 1.47 3.93.52 2.72-2.23.37-4.93-7.77-8.94-7.11-3.5-15.71 1.61-11.46 6.8 1.37 1.67 2.59 1.98 2.72.68zm86.15 91.18c.8-.65 1.65-3.24 1.9-5.75.36-3.55 1-3.9 2.92-1.56 1.49 1.82 2.72-1.3 3.14-7.99.74-11.96-6.47-22.11-10.59-14.9-1.44 2.52-2.41 2.66-2.71.37-.26-1.96-3.28-4.52-6.71-5.69-5.2-1.78-5.98-2.89-4.73-6.7 1.28-3.89.96-4.12-2.2-1.58-3.26 2.62-2.39 4.24 7.37 13.67 7.77 7.49 10.05 10.82 7.65 11.14-1.88.26-3.23 1.9-2.99 3.66.23 1.76 1.84 2.05 3.56.63 1.73-1.41 2.95-3.98 2.72-5.71-.23-1.74.47-3.89 1.57-4.78 1.65-1.36 2.69 1.64 4.62 13.3.11.67-2.19 1.2-5.11 1.18-6.81-.05-10.84 6.78-5.73 9.69 2.13 1.21 4.52 1.67 5.32 1.02zm-55.72-73.17c3.01-2.46-.83-5.38-5.17-3.94-2.67.88-2.78 2.01-.34 3.39 2 1.15 4.48 1.39 5.51.55zm26.52 33.91c2.08-1.86 2.11-2.72.07-2.08-2.52.78-3.77-.5-4.6-4.7-1.08-5.48-4.48-5.66-5.02-.26-.53 5.29 6.08 10.16 9.55 7.04zm27.29 2.39c1.15-.94 1.27-2.71.27-3.92-.99-1.22-2.27-.87-2.84.79-.57 1.65-.7 3.42-.28 3.92.42.51 1.7.16 2.85-.79zm54.61 57.25c.27-2.73-.4-3.81-1.71-2.74-2.79 2.29-3.24 6.79-.7 7.04 1.08.11 2.17-1.83 2.41-4.3zm-42.91-54.35c1.32-2.31 3.63-3.8 5.15-3.31 5.03 1.62 14.77-3.64 12.3-6.65-2.35-2.87-21.22 3.34-22.63 7.45-1.56 4.53 2.82 6.66 5.18 2.51zm9.55 5.92c2.92-1.16 5.48-.79 5.69.82.22 1.6 1.86 1.72 3.65.25 5.69-4.65-1.21-8.66-9.6-5.59-4.44 1.63-7.39 3.78-6.56 4.8.83 1.01 3.9.89 6.82-.28zm44.71 40.81c.96-1.76-.6-1.27-3.48 1.08-2.87 2.36-3.66 3.8-1.75 3.2 1.91-.6 4.27-2.53 5.23-4.28zm13.08-9.54c1.23-1-.06-2.16-3.04-2.74-2.85-.55-5.5-.74-5.9-.41-.4.32.97 1.56 3.05 2.74 2.07 1.18 4.73 1.37 5.89.41zm13.91 21.95c5.23-.7 4.14-3.02-1.58-3.35-2.83-.17-4.38.62-3.46 1.75.93 1.13 3.19 1.85 5.04 1.6zm-49.49-64.43c.56-1.65.69-3.42.27-3.93-.41-.51-1.69-.15-2.84.79-1.15.94-1.28 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm27.51 33.13c.63-1.84 3-2.71 5.27-1.93 3.24 1.12 4.13.49 4.2-2.96.04-2.41-.17-3.48-.47-2.38-.3 1.11-3.05 1.76-6.11 1.45-5.68-.56-8.83 3.31-5.75 7.07.94 1.15 2.23.59 2.86-1.25zm31.44 28.65c.45-.37.18-2.59-.59-4.93-.81-2.45-1.85-3-2.44-1.3-.98 2.86 1.33 7.62 3.03 6.23zm-8.02-24.99c2.84.94 4.44 3.14 4.42 6.07-.05 8.06 2.53 4.75 3.7-4.73.93-7.59.63-8.31-1.73-4.23-2.51 4.34-2.84 4.23-2.86-.94-.01-3.21 1.24-6.01 2.77-6.21 1.54-.21 1.98-1.37.98-2.59-2.22-2.71-4.42-1.03-6.38 4.89-.98 2.95-2.73 4.07-5.13 3.27-2-.66-2.87-.26-1.93.89.94 1.16 3.72 2.76 6.16 3.58zM96.447 260.87c2.45 1.83 6.1 3.15 8.1 2.92 2.66-.29 2.98.14 1.19 1.65-1.34 1.12-1.51 4.04-.39 6.49 1.12 2.44-1.43.2-5.67-4.97-4.24-5.18-5.69-7.92-3.23-6.09zm21.98 23.13c1.26.12 2.82 1.87 3.45 3.87.7 2.22-.21 2.13-2.3-.23-1.9-2.13-2.41-3.77-1.15-3.64zm27.34 24.64c1.73.94 4.08 3.74 5.22 6.21 1.13 2.47-.28 1.69-3.15-1.72-2.87-3.42-3.8-5.44-2.07-4.49zm-3.7-10.01c1.22-1 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.28.29-3.93-.28-1.65-.57-2.01-1.85-.79-2.85zm109.45-2.27c1.32-1.08.52-3.15-1.8-4.64-3.49-2.26-3.39-2.48.59-1.38 4.98 1.38 6.27 8.7 1.44 8.22-1.43-.14-1.53-1.14-.23-2.2zm11.83.79c1.15-.94.94-3.12-.48-4.85-1.41-1.72-1.63-3.9-.47-4.85 1.15-.94.93-3.12-.48-4.85-2.98-3.64 1.45-8 9.8-9.64 6.42-1.27 10.48 2.34 12.15 10.8.93 4.73.02 5.83-6.13 7.42-3.97 1.02-8.48.53-10.02-1.1-1.54-1.62-1.56-.15-.06 3.28 3.14 7.16.37 13.78-3.69 8.82-1.49-1.82-1.77-4.08-.62-5.03zm-150.5-211.77c.12-8.66-.93-11.18-5.44-13.05-7.03-2.92-8.1-4.22-5.31-6.5 1.22-1 2.39-.49 2.6 1.12.22 1.61 1.67 2.76 3.24 2.55 1.56-.2 1.8-2.65.52-5.44-1.55-3.37-.86-5.54 2.05-6.51 2.41-.79 5.04-.63 5.85.36.82.99 2.45.1 3.63-1.97 1.19-2.08 3.01-2.73 4.05-1.46s.48 3.47-1.24 4.88c-1.73 1.42-2.32 3.57-1.33 4.79 1 1.22.4 2.4-1.33 2.63-5.23.7-1.47 3.03 8.12 5.03 8.46 1.76 8.72 1.65 4.03-1.88-2.75-2.06-4.26-4.37-3.34-5.13 2.69-2.19 7.11 1.81 14.15 12.83 5.88 9.2 5.96 10.2.77 9.49-5.26-.72-5.78-.05-5.64 7.29.16 7.79-3.52 14.76-4.38 8.31-.24-1.73-2.26-1.64-4.51.2-8.03 6.57-16.69-2.64-16.49-17.54zm5.12-11.58c-1.82-3.32-2.79-7.55-2.15-9.4.63-1.86-.18-3.51-1.8-3.67-4.25-.42-2.58 8.19 2.73 14.07l4.53 5.02-3.31-6.02zm21.65 42.54c.05-10.49 2.38-12.01 3.42-2.22.77 7.18 1.25 7.7 6.42 6.87 3.08-.5 4.62-.06 3.43.97-1.19 1.04-4.67 1.97-7.74 2.08-5.14.18-5.57-.42-5.53-7.7zm23.48 17.91c3.73-12.7 2.56-19.03-2.77-15.05-2.05 1.53-3.12 1.61-2.36.18.75-1.42 2.34-3 3.53-3.49 1.2-.5 1.64-4.4 1-8.68-.66-4.41-.31-5.64.82-2.85 1.09 2.72 4.38 5.43 7.31 6.03 4.5.92 4.59 1.34.63 2.69-6.31 2.14-5.28 6.92 2.15 10 3.34 1.39 4.67 2.71 2.96 2.93-4.97.67 3.01 12.67 8.8 13.25 2.87.28 5.96 1.43 6.87 2.54 2.35 2.87-1.99 9.59-5.43 8.41-1.58-.54-3.78-.25-4.89.66-1.11.91 1.53 2.77 5.87 4.13 4.34 1.37 7.83 1.26 7.75-.23-.21-4.19 5.96-10.2 7.97-7.75.98 1.2.02 3.63-2.14 5.4-2.16 1.77-3.95 5.58-3.97 8.48-.02 4.32.58 4.77 3.36 2.49 4.85-3.97 8.48 1.8 6.07 9.64-1.18 3.83-.13 9.45 2.47 13.25 2.48 3.63 4 5.05 3.38 3.15-.63-1.91.16-3.63 1.74-3.85 1.58-.21 1.94-1.67.79-3.24-1.16-1.57.25-1.64 3.12-.14 4.47 2.31 4.81 2.16 2.38-1.07-1.57-2.08-1.98-4.5-.91-5.38 1.07-.87.66-4.07-.92-7.1-1.59-3.03.45-1.16 4.52 4.16 6.6 8.64 6.85 10 2.29 12.79-3.86 2.36-4.2 4.06-1.39 7.01 2.04 2.14 4.07 2.82 4.52 1.51.45-1.31 3.48.64 6.74 4.34l5.91 6.72-3.72-7.44-3.71-7.44 6.41 5.22c3.53 2.88 5.96 6.52 5.42 8.11-.61 1.78 1.84 4.28 6.39 6.52 6.35 3.12 7.18 4.39 5.96 9.12-.79 3.02-.52 5.59.58 5.7 1.1.11 1.01 1.94-.21 4.08-2.83 4.96-5.41 1.91-4.1-4.83 1.49-7.66-6.2-15.89-11.09-11.89-2.18 1.78-7.39 3.26-11.6 3.28-6.4.04-8.44-1.42-12.54-8.91-2.7-4.93-3.74-9.12-2.31-9.31 1.42-.18 2.39-1.78 2.16-3.54-.24-1.76-1.67-2.19-3.19-.94-1.51 1.24-5.62 1.28-9.11.1-5.54-1.87-6.23-3.14-5.33-9.75 1.29-9.54-.11-11.2-12-14.21-8.51-2.16-9.76-3.29-11.08-9.95-.81-4.13-.19-9.5 1.39-11.92 1.58-2.42 1.59-4.85.03-5.38-1.56-.54-3.34.49-3.96 2.28-.67 1.95-1.31 1.8-1.6-.37-.27-2-1.45-2.85-2.64-1.88-1.18.97-2.76-.11-3.52-2.39-1-3.03-2.03-3.01-3.8.1-1.5 2.63-.83 5.42 1.78 7.32 2.32 1.68 2.93 3.23 1.36 3.44-5.71.76-7.29-5.34-4.14-16.05zm5.47-4.05c1.29-3.12 1.96-6.14 1.49-6.71-.47-.58-1.91 1.5-3.2 4.61-1.3 3.12-1.97 6.14-1.5 6.71.47.58 1.92-1.5 3.21-4.61zm19.72 15.29c1.22-.99.86-2.28-.79-2.84-1.66-.57-3.42-.7-3.93-.28-.51.41-.15 1.69.79 2.84.94 1.16 2.71 1.28 3.93.28zM75.117 35.52c.5-.42 2.27-.29 3.92.28 1.66.56 2.01 1.84.79 2.84-1.21 1-2.98.87-3.92-.28-.95-1.15-1.3-2.43-.79-2.84zm219.73 261.23c4.33-4.13 7.48-1.69 4.52 3.51-1.12 1.96-3.43 2.76-5.13 1.79-1.73-.98-1.46-3.33.61-5.3zm-145.93-184.13c1.17-2.07.99-4.15-.41-4.64-3.72-1.27-8.95-13.43-6.61-15.34 1.09-.9 2.17-.23 2.4 1.49.25 1.85 1.42 1.35 2.89-1.23 1.93-3.38 2.83-3.28 4.07.48.88 2.66 2.48 5.94 3.57 7.3 1.27 1.6.53 1.99-2.12 1.12-3.05-1.01-3.35.2-1.2 4.76 1.58 3.37 1.45 7.3-.3 8.74-4.05 3.31-5.05 2.15-2.29-2.68zm106.58 127.83c-.3-2.24.77-5.5 2.36-7.25 2.2-2.42 3.59-1.72 5.77 2.9 3.34 7.09 8.19 4.97 5.29-2.32-2.6-6.53 6.72-13.02 11.77-8.18 2.07 1.98 2.27 2.87.44 1.96-4.66-2.31-9.78 2.56-6.68 6.35 1.42 1.72 3.98 1.98 5.71.57 1.88-1.54 4.65-.66 6.92 2.19 3.76 4.74 3.75 4.76-3.31 3.58-3.89-.65-8.42-.48-10.05.37-4.92 2.58 1.53 7.71 6.97 5.55 2.77-1.1 8.62-.87 13 .5 4.38 1.38 6.55 2.7 4.82 2.93-3.37.45-1.75 8.62 1.97 9.9 1.23.42.95 1.82-.62 3.1-1.83 1.5-3.79.47-5.42-2.84-5.14-10.42-6.87-11.8-13.12-10.45-14.42 3.12-24.69-.4-25.82-8.86zm5.55 2.69c1.15-.94 1.27-2.71.27-3.93-.99-1.22-2.27-.86-2.84.79-.57 1.65-.7 3.42-.28 3.93.42.51 1.7.15 2.85-.79zm9.82 4.28c.11-1.17-1.91-2.33-4.5-2.58-3.75-.36-3.79.08-.22 2.13 2.48 1.42 4.6 1.62 4.72.45zm45.46 67.5c.57-1.66 1.85-2.01 2.84-.79 1 1.21.88 2.98-.27 3.92-1.15.95-2.44 1.3-2.85.79-.42-.5-.29-2.27.28-3.92zm-6.88-12.93c1.92-.74 4.92-.44 6.66.66 1.81 1.14 1.66 2.57-.33 3.33-1.93.73-4.92.43-6.66-.67-1.81-1.14-1.67-2.56.33-3.32zm-100.68-129.12c1.18-2.07 2.84-2.9 3.7-1.86 2.32 2.84.05 7.64-3.1 6.56-1.51-.52-1.78-2.63-.6-4.7zm-.63-15.68c-.44-3.86.24-3.86 3.44 0 2.23 2.68 2.6 4.99.84 5.23-3.79.5-3.61.72-4.28-5.23zm92.71 110.69c5.09-3.05 7.44-1.83 6.43 3.36-.74 3.83-1.84 4.18-5.27 1.69-2.79-2.03-3.2-3.82-1.16-5.05zm60.53 72.19c4.7-3.14 6.75-2.63 12.23 3.06 4.6 4.79 5.27 6.44 2.2 5.5-2.41-.74-4.92-2.99-5.59-5.01-.69-2.09-4.06-2.83-7.85-1.71l-6.63 1.94 5.64-3.78zm3.46 8.49c.57-1.65 1.85-2.01 2.85-.79.99 1.22.87 2.99-.28 3.93s-2.43 1.3-2.85.79c-.41-.51-.29-2.27.28-3.93zm-187.51-231.58c1.26.13 2.81 1.87 3.45 3.87.69 2.22-.21 2.13-2.3-.22-1.9-2.13-2.42-3.77-1.15-3.65zm135.56 163.96c1.82.62 4.35-.71 5.63-2.95 1.92-3.36 1.3-4.44-3.51-6.08-4.7-1.61-5.55-2.86-4.36-6.35 1.2-3.53.18-5-5.38-7.73-3.77-1.85-6.03-4.04-5.03-4.86 2.45-2 13.4 5.96 18.65 13.56 2.33 3.37 5.25 5.3 6.49 4.29 1.23-1.01 3.11-.79 4.16.49 1.09 1.33-.34 3.38-3.31 4.74-4.19 1.92-4.29 2.58-.53 3.31 2.58.5 5.66-.79 6.85-2.86 1.7-2.98 3.22-2.17 7.27 3.86 4.38 6.52 4.33 8.45-.32 13.24-7.32 7.53-12.07 6.54-21.76-4.51-4.48-5.11-6.67-8.78-4.85-8.15zm27.61 5.44c.46-.37-.33-2.08-1.74-3.81-1.41-1.72-3.48-2.39-4.6-1.47-1.11.91-.32 2.62 1.75 3.81 2.08 1.18 4.14 1.84 4.59 1.47zm30.35 66.94c1.26.13 2.81 1.87 3.45 3.88.7 2.21-.21 2.12-2.3-.23-1.9-2.13-2.41-3.77-1.15-3.65zm-121.71-154.59c-1.32-4.61-1.06-5.02 1.42-2.24 1.67 1.88 2.58 4.77 2.01 6.42-1.19 3.46-1.25 3.39-3.43-4.18zm14.98 13.94c-2.38-6.11-2.16-6.08 2.72.4 2.91 3.86 4.55 7.62 3.64 8.37-1.91 1.57-2.87.25-6.36-8.77zm27.26 24.85c-1.33-4.61-1.06-5.03 1.42-2.24 1.67 1.88 2.57 4.77 2.01 6.42-1.19 3.45-1.25 3.38-3.43-4.18zm15.38 10.11c1.12-.91 3.18-.25 4.6 1.48 1.41 1.73 2.2 3.44 1.74 3.81-.45.37-2.52-.29-4.59-1.48-2.08-1.18-2.86-2.9-1.75-3.81zm50.23 55.09c-1.04-7.59-2.94-12.29-4.89-12.03-1.95.26-2.78-1.67-2.13-5 .57-2.98 2.15-5.31 3.49-5.17 1.35.13 1.35 1.14.01 2.24-1.35 1.1-1.63 2.99-.63 4.21 1 1.22 2.32.75 2.93-1.04.62-1.79 1.95.64 2.95 5.39 1.72 8.11 2.1 8.46 6.2 5.59 3.51-2.46 3.36-3.74-.76-6.51-3.97-2.67-4.12-3.38-.64-3.13 6.61.49 10.3 11.37 4.51 13.31-3.56 1.19-3.55 1.62.06 1.99 3.62.38 4.86-.78 5.77-5.38 1.06-5.39 1.27-5.3 2.53 1.06.76 3.81 2.68 7.73 4.27 8.73 1.59.99 4.1 5.84 5.58 10.76 3.1 10.31 6.78 13.1 15.76 11.95 8.63-1.11 9.5-5.3 2.51-12.07-4.77-4.61-4.94-5.61-.95-5.59 2.67.02 5.56 1.22 6.42 2.66.86 1.44 6.35 4.99 12.21 7.88 5.85 2.89 11.91 7.01 13.47 9.14 1.55 2.13 3.26 2.6 3.79 1.05.54-1.56 1.73-1.91 2.65-.78.92 1.12 3.68 3.28 6.14 4.79 3.99 2.45 3.77 2.58-2.09 1.25-5.39-1.22-6.74-.56-7.57 3.72-1.49 7.69-7.57 3.15-6.31-4.72.91-5.66.32-6.36-9.59-11.36-9.14-4.61-10.01-4.6-6.47.05 5 6.58 6.32 14.83 2.29 14.43-1.62-.16-2.27-2.24-1.46-4.63.82-2.38.07-4.42-1.68-4.54-1.74-.12-2.63 1.31-1.96 3.16 2.1 5.88-2.46 6.73-6.91 1.29-2.36-2.87-5.19-4.48-6.31-3.57-3.52 2.89 15.52 13.24 26.38 14.35 3.73.38 7.61 1.7 8.62 2.93 1.01 1.23-5.66.77-14.82-1.03-11.55-2.28-18.29-5.28-21.99-9.79-3.19-3.89-8.31-6.66-12.74-6.88-4.08-.2-7.92-1.9-8.54-3.77-.62-1.88-3.41-3.43-6.19-3.45-7.31-.04-11.98-7.26-13.91-21.49zm34.48 17.05c-.59-3.36-.74-7.37-.34-8.89.4-1.53-1.72-4.51-4.7-6.63-5.42-3.85-5.41-3.86 2.01-1.21 7.57 2.7 12.76 6.56 8.2 6.11-1.38-.14-1.86 2.75-1.07 6.41 1 4.67 2.48 6.58 4.91 6.39 2.1-.17 2.08.88-.03 2.64-4.81 4.02-7.73 2.45-8.98-4.82zm47.95 42.36c-2.29-6.31-1.53-7.91 6.95-14.47 6.57-5.08 10.26-6.47 11.9-4.47 1.96 2.4 1.42 2.89-3.15 2.86-4.87-.03-4.67.84 1.76 7.48 4 4.13 8.61 6.99 10.24 6.36 1.91-.74.89-2.92-2.87-6.12-3.21-2.73-4.59-4.89-3.07-4.79 1.51.09 7.03 4.74 12.25 10.33 8.24 8.83 8.8 10.16 4.23 10.13-4.21-.03-4.99-.82-3.97-4.01 1.03-3.18.32-3.87-3.54-3.47-6.99.74-9.02 3.07-4.77 5.49 2.03 1.16 3.25 3.4 2.7 4.98-.54 1.58-2.57.94-4.51-1.43s-4.25-3.75-5.14-3.07c-.88.68-4.94 1.25-9.01 1.27-6.07.03-7.89-1.25-10-7.07zm-13.53-28.62c.57-1.65 1.8-2.06 2.74-.91.95 1.15 1.25 3.44.68 5.1-.56 1.65-1.8 2.06-2.74.91-.94-1.15-1.25-3.44-.68-5.1z',
												fill: '#bb5326',
											}),
											Object(Ot.jsx)('path', {
												d: 'M79.027 238.45c1.15-.94 2.86-.77 3.8.38s2.76 1.23 4.05.18c1.35-1.11.14-3.74-2.88-6.27-2.87-2.4-4.17-4.5-2.88-4.67 3.96-.53 2.65-10.21-2.35-17.26-5.16-7.27-7.02-7.23-7.78.16-.4 3.82-.81 3.98-2.07.82-.86-2.18-3.09-6.94-4.95-10.6-3.16-6.19-2.66-7.2 7.38-15.05 10.04-7.85 11.18-8.08 16.8-3.47 3.31 2.72 7.2 4.22 8.64 3.34 1.44-.89 3.71-2.33 5.04-3.2 6.29-4.12 19.92-3.12 23.91 1.75 2.33 2.85 3.24 6 2.03 7-1.22.99-.83 2.29.86 2.87 1.69.58 2.16 1.51 1.03 2.07-2.4 1.2-11.16 13.35-10.34 14.35 3.63 4.44 13.72 7.32 15.39 4.41 3.97-6.97 20.03 10.42 18.57 20.12-1.12 7.48-13.85 12.84-18.11 7.64-1.49-1.82-3.13-2.08-3.65-.57-1.03 2.98 8.1 12.2 18.9 19.08 4.96 3.16 7.31 6.67 8.62 12.86 1 4.69 2.53 9.41 3.42 10.49 2.84 3.46 10.94-.85 10.13-5.39-.47-2.62 1.59-5.56 5.3-7.58 4.78-2.59 6.94-2.06 10.24 2.51 2.3 3.18 4.25 7.66 4.35 9.95.23 5.58 27.69 14.31 28.22 8.98.47-4.69 7.92-7.31 12.83-4.51 2.51 1.44 2.27 4.49-.75 9.42-3.98 6.51-2.4 15.4 2.09 11.73.97-.79 4.58-.05 8.03 1.65 4.99 2.46 6.1 4.33 5.45 9.17-2.48 18.3-1.64 24.88 3.61 28.37 7.85 5.21 18.95 5.29 23.66.17 3.42-3.71 3.05-5.63-2.2-11.43-3.47-3.84-7.59-6.49-9.16-5.89-1.88.71-3.21-.72-3.89-4.19-1.68-8.51 11.03-14.25 24.48-11.06 13.2 3.14 16.35 8.78 8.48 15.22-4.78 3.91-4.81 5.01-.23 8.05 13.77 9.1 14.9 10.66 11.49 15.89-2.24 3.44-5.77 5.04-10.6 4.8-6.22-.31-7.17.3-6.68 4.28.83 6.72 8.13 14.6 16.49 17.8 4 1.53 10.14 6.22 13.65 10.43 6.09 7.28 6.06 7.89-.55 13.04-3.81 2.97-8.25 4.98-9.86 4.47-1.61-.51-5.28.77-8.16 2.84-6.38 4.6-10.96.76-28.24-23.69-6.05-8.57-9.61-11.6-13.6-11.58-4.28.03-4.63.31-1.69 1.36 2.04.73 2.72 2.15 1.5 3.14-2.77 2.27-3.85.98-5.29-6.3-.87-4.41-1.57-4.98-3.03-2.43-2.42 4.25-19.74 2.09-21.31-2.64-.65-1.97-1.76-4.05-2.47-4.63-.71-.58-.34-6.13.82-12.34s1.21-12.39.11-13.73c-2.51-3.07-15.63-1.73-18.59 1.89-1.21 1.49-2.6 1.77-3.07.63-.48-1.14-4.52-3.18-8.97-4.54-4.82-1.46-10.64-5.89-14.38-10.93-3.46-4.66-9.63-10.26-13.71-12.45-5.69-3.05-9.22-7.32-15.05-18.19-6.49-12.12-8.71-14.56-15.08-16.56-7.43-2.34-24.39-21.51-19.62-22.19 1.29-.19 1.59-1.26.67-2.38-.92-1.12-2.31-3.98-3.1-6.35-.96-2.91-3.61-3.58-8.13-2.07-3.69 1.23-10.29.33-14.66-2.02-4.38-2.34-8.78-3.58-9.79-2.76-1.01.83-2.61.57-3.55-.58-.95-1.15-.77-2.87.38-3.81zm20.72-10.16c.08-5.37-4.73-20.1-5.67-17.37-.73 2.13-1.68 1.68-2.65-1.27-.84-2.51-2.36-3.88-3.39-3.04-1.03.85-.86 3.46.37 5.81 3.54 6.74 11.32 17.61 11.34 15.87zm-2.11-22.57c1.7 2.07 6.71-2.97 7.13-7.17.16-1.62-2.62-2.79-6.19-2.6-8.55.47-11.28 2.95-6.34 5.76 2.19 1.25 4.62 3.05 5.4 4.01zm104.48 127.59c1.15-.94 1.32-2.65.38-3.8a2.72 2.72 0 0 0-3.81-.38 2.71 2.71 0 0 0-.37 3.81 2.698 2.698 0 0 0 3.8.37zm8.88-14.41c4.21-.83 5.44-2.04 4.55-4.47-1.71-4.69-7.21-7.52-8.32-4.29-.51 1.48-1.74 1.69-2.74.47-.99-1.22-2.75-1.44-3.9-.5-3.73 3.05 4.46 9.97 10.41 8.79zM39.887 186.64c1.22-.99 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.28.29-3.93-.28-1.65-.57-2.01-1.85-.79-2.85zm12.97 15.59c.57-1.65 1.85-2.01 2.85-.79.99 1.22.87 2.98-.28 3.93-1.15.94-2.43 1.29-2.85.79-.41-.51-.29-2.28.28-3.93zm-41.03-67.54c1.19-.16 1.01-2.81-.4-5.88-1.42-3.08-3.77-5.46-5.24-5.29-9.72 1.14-6.51-44.76 4.18-59.74 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-10.98-2.43-12.22-6.48-5.52-18.07 6.62-11.47 19.72-24.79 17.57-17.86-.8 2.55-3.47 6.33-5.95 8.39-6 4.98-9.42 11.24-7.46 13.64.97 1.19 2.4.03 3.68-2.98 1.14-2.7 5.85-8.95 10.46-13.89 4.61-4.93 7.64-7.46 6.74-5.63-.9 1.83-.6 4.6.67 6.15 1.78 2.18.42 3.63-5.98 6.39-9.27 3.99-12.54 11.77-3.43 8.15 10.53-4.2 10.34 3.23-.51 19.84-4.03 6.17-5.97 12.3-4.74 14.99 1.15 2.5 1.21 5.27.12 6.16-1.08.89-2.16.2-2.39-1.53-.95-7.13-5.79 2.13-9.84 18.84-2.83 11.67-3.05 18.55-.64 19.92 2.03 1.16 2.43 2.27.9 2.47-1.53.21-2.14 2.32-1.35 4.71 1.99 6.01 2.91 6.79 4.06 3.44 1.09-3.18 7.75 12.59 7.51 17.78-.09 1.74 1.29 3.99 3.06 5 1.76 1 2.7 3.32 2.07 5.15-.77 2.23-2.96.76-6.67-4.44-3.04-4.27-4.56-7.89-3.37-8.05zm3.86-91.99c5.41-.12 5.44-.26.29-1.41-3.14-.71-5.91-2.76-6.15-4.57-.24-1.81-1.44-2.47-2.65-1.47-3.5 2.86 1.9 7.59 8.51 7.45zm11.72 112.55c-2.4-4.4-2.16-5.48.98-4.4 5.57 1.92 5.56-1.48-.05-10.42-8.53-13.61-12-21.85-9.92-23.55 1.14-.93-.07-3.09-2.68-4.79-3.8-2.47-3.78-5.79.11-16.68 3.6-10.09 3.77-14.41.66-16.78-2.87-2.18-2.95-3.06-.27-2.8 5.89.59 10.65-7.72 6.98-12.2-1.77-2.17-2.23-4.76-1.01-5.76 1.22-.99 2.4-.39 2.64 1.34.23 1.73 1.94 1.9 3.8.38 2.15-1.76 2.03-3.26-.33-4.1-2.84-1.02-2.55-1.35 1.24-1.44 2.72-.06 7.67-2.54 11-5.52 3.63-3.23 9.12-5.11 13.7-4.67 4.2.41 13.31.5 20.24.2 11.61-.5 13.23.26 20.38 9.52 4.49 5.82 5.56 8.18 2.53 5.61-5.92-5.06-20.35-7.79-24.25-4.6-2.02 1.66-.9 3.09 5.14 6.59 7.16 4.15 7.57 5.21 5.59 14.46l-2.14 9.99 9.94.61c11.78.72 13 1.88 13.28 12.58.12 4.49.75 10.08 1.41 12.42.66 2.34-.57 1.38-2.74-2.12-2.17-3.51-4.86-5.64-5.97-4.72-1.11.91-2.62-.14-3.35-2.34-1.88-5.69-21.99-8.36-27.7-3.68-4.59 3.75-3.74 9.59.97 6.63 1.26-.8 3.5-2.23 4.96-3.19 1.46-.95 4.18-.77 6.05.41 2.5 1.58 2.01 2.56-1.89 3.74-2.9.88-6.49 2.52-7.97 3.65-1.48 1.12-3.92.55-5.41-1.27-1.89-2.3-2.79-.23-2.96 6.82-.2 8.48-1.47 10.75-7.78 13.95-4.37 2.22-6.84 4.69-5.88 5.86 2.66 3.25 18.37-7.97 16.99-12.13-1.5-4.54 12.6-14.84 16.94-12.37 1.73.98 4.88.47 6.99-1.13 3.01-2.3 3.16-1.7.67 2.82-3.95 7.2-1.05 11.24 4.69 6.54 2.37-1.94 4.49-2.1 4.73-.35.23 1.75 3.31 2.27 6.85 1.16 4.81-1.52 5.53-1.24 2.88 1.1-2.16 1.9-2.21 4.78-.13 7.32 1.89 2.3 2.56 4.89 1.51 5.75-5.13 4.2-11.01 3.98-14.72-.55-3.23-3.95-5.2-4.1-9.32-.73-3.08 2.52-6.22 3.09-7.62 1.37-2.67-3.25-10.62-1.49-12.05 2.68-.51 1.49-1.57.78-2.34-1.56-1.54-4.63-5.02-2.6-9.64 5.64-2.64 4.69-2.32 4.91 5.63 4.07 4.63-.5 10.51-2.36 13.07-4.15 2.55-1.79 4.81-3.04 5.02-2.79.21.26 1.51 3.84 2.89 7.96 1.88 5.64 3.57 7.43 6.79 7.23 3.1-.2 3.03.22-.27 1.52-2.5.99-4.27 3.63-3.93 5.87.94 6.13-3.73 14.5-10.3 18.47-3.21 1.95-7.38 4.53-9.27 5.75-3.4 2.2-12.74-6.13-9.68-8.63 3.26-2.68-3.81-7.49-9.87-6.71-6.16.79-9.3-1.97-15.81-13.88zm22.49 9.23c1.15-.95 1.32-2.66.38-3.81a2.721 2.721 0 0 0-3.81-.38 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm1.21-80.75c.72-7.27.38-7.91-2.84-5.26-2.02 1.65-3.02 4.96-2.23 7.35 1.06 3.2.47 4.02-2.2 3.1-2.12-.72-4.21.39-4.99 2.66-1 2.91.29 3.47 5.05 2.17 5.13-1.4 6.55-3.37 7.21-10.02zm158.24 263.08c1.4-4.07 9.36-6.04 11.89-2.95 3.74 4.57-1.66 10.33-7.44 7.93-3.19-1.32-5.01-3.36-4.45-4.98zm45.83 40.89c3.86-3.16 8.93-1.48 7.56 2.51-.58 1.68-1.91 2-2.97.71-1.05-1.28-2.38-.98-2.95.67-.56 1.65-1.85 2.01-2.84.79-1-1.22-.46-3.33 1.2-4.68zm-245-300.18c.14-1.39 1.22-3.33 2.41-4.3 1.31-1.07 1.99 0 1.72 2.73-.25 2.48-1.34 4.41-2.42 4.31-1.08-.11-1.85-1.34-1.71-2.74zm77.38 84.55a2.7 2.7 0 1 1 3.423 4.18 2.7 2.7 0 0 1-3.423-4.18zm2.96-8.5c3.13-2.18 4.62-2.04 4.37.44-.24 2.48-1.86 3.61-4.74 3.32-3.29-.32-3.2-1.25.37-3.76zm37.92 43.71c1.39-2.44 2.51-2.33 3.4.34.72 2.19.47 4.67-.55 5.51-3.01 2.46-5.12-1.87-2.85-5.85zm197.15 233.63c2.59.25 4.62 1.41 4.5 2.58-.11 1.17-2.23.97-4.71-.45-3.58-2.05-3.53-2.49.21-2.13zM81.267 138.79c1.15-.94 2.86-.77 3.8.38a2.69 2.69 0 0 1-.38 3.8c-1.15.94-2.86.77-3.8-.38s-.77-2.86.38-3.8zm242.71 292.14c1.73-.23 3.87.47 4.76 1.55.89 1.09.67 2.74-.48 3.68-1.15.95-3.29.25-4.76-1.54-1.47-1.8-1.25-3.45.48-3.69zM137.467 199.8c.44-1.3 2.24-.62 3.98 1.51 1.75 2.13 2.06 4.03.7 4.21-1.36.18-3.16-.5-3.99-1.52-.83-1.01-1.14-2.9-.69-4.2zm26.2 26.92c3.96.19 7.39 1.95 7.64 3.89.28 2.27-.9 2.44-3.28.48-2.05-1.69-4.6-2.36-5.66-1.48-1.07.87-2.83.5-3.92-.83-1.13-1.38 1.11-2.26 5.22-2.06zm13.06 21.37c-1.59-3.44-.68-5.29 3.46-7.02 3.09-1.29 6.88-3.01 8.43-3.81 4.46-2.31 13.87-1.63 16.16 1.16 2.77 3.38-3.08 14.88-10.77 21.18-5.41 4.42-6.74 4.31-10.65-.89-2.45-3.27-5.44-8.05-6.63-10.62zm-44.36-66.64c1.27-3.21.73-4.54-1.7-4.22-4.5.6-7.5-2.88-4.57-5.28 1.22-.99 2.44-.15 2.71 1.88.32 2.42 1.25 2.35 2.71-.22 1.66-2.9 2.81-2.65 4.47.99 1.7 3.69 3.33 4 6.69 1.25 3.87-3.17 4.55-2.85 5.23 2.48.96 7.47-3.4 14.01-8.97 13.46-5.95-.6-8.69-4.92-6.57-10.34zm202.17 249.58c-.3-2.64-2.27-6.93-4.37-9.53-4.37-5.42-1.27-9.06 8.14-9.57 4.57-.25 6.73-1.63 7.32-4.68 1.01-5.23-5.13-13.28-10.54-13.82-2.7-.27-1.7-1.72 3.17-4.65 3.91-2.34 7.84-3.37 8.73-2.28.89 1.08 1.99.89 2.44-.43.46-1.32 3.46-1.51 6.67-.43 3.21 1.09 4.99 2.68 3.95 3.53-1.04.86 1.08 4.86 4.72 8.9 6.41 7.12 7.67 13.73 3.8 19.87-1.48 2.34.18 4.36 7.9 9.57 5.38 3.62 10.17 6.27 10.64 5.89 2.33-1.91 7.4-14.47 6.35-15.75-.65-.8 1.53-3.51 4.85-6.03 8.63-6.53 14.82.6 10.57 12.18-3.23 8.84.42 17.59 6.39 15.32 4.62-1.76 11.56-10.59 9.91-12.6-1.84-2.25-.68-13.26 1.59-15.12 3.57-2.92 13.84-.16 17.91 4.8 3.02 3.69 5.31 4.14 8.34 1.66 3.22-2.63 3.05-4.82-.74-9.44-8.25-10.08-13.15-21.11-10.39-23.37 5.35-4.39 13.62.02 23.49 12.52 11.38 14.41 15.2 13.91 10.94-1.41-2.64-9.5-2.45-10.21 1.77-6.49 2.6 2.31 5.13 7.9 5.61 12.43.71 6.61 2.18 8.89 7.42 11.47 6.26 3.07 6.23 3.45-.59 8.43-11.23 8.21-12.21 9.68-9.05 13.61 1.73 2.14 1.58 3.31-.34 2.78-1.82-.5-9.59 4.29-17.26 10.64-8.48 7.01-15.83 11.36-18.71 11.07-6.54-.65-9.36 2.18-4.78 4.79 2.08 1.18 2.63 3.09 1.23 4.25-1.39 1.15 1.41 1.28 6.22.27 4.82-1 9.59-3.27 10.6-5.05 1.01-1.78 3.24-2.75 4.96-2.16 1.87.65 8.99-4.29 17.86-12.37 9.22-8.4 15.78-12.89 17.5-11.98 1.74.93 2.62-.14 2.41-2.94-.26-3.63.29-4.05 3.19-2.39 1.93 1.1 3.65 5.62 3.83 10.04.18 4.42 1.81 8.89 3.62 9.92 2.08 1.19 1.67 3.22-1.11 5.49-2.42 1.99-5.3 2.51-6.4 1.17-1.1-1.34-2.09-1.54-2.2-.45-.44 4.43 8.18 6.41 11.56 2.66 4.42-4.92 3.08-22.79-1.67-22.16-2 .26-2.37-1.18-.95-3.68 1.37-2.4 2.52-2.82 2.76-1 .48 3.6 1.52 3.05 4.68-2.5 2.72-4.77-3.06-12.84-6.93-9.67-1.5 1.23-2.89 3.92-3.09 6-.25 2.48-3.59 2.54-9.83.18-5.2-1.97-8.16-3.52-6.58-3.44 4.69.25 7.83-10.65 3.73-12.99-2.04-1.16-2.67-2.26-1.39-2.44 1.27-.18 2.16-3.81 1.97-8.08-.31-7.21-.73-7.75-6.11-7.73-5.1.01-5.19.36-.79 2.92 3.59 2.09 3.83 2.79.85 2.51-2.79-.27-4.81-2.56-6.25-7.11-1.16-3.69-1.27-5.84-.24-4.76s3.92 2.64 6.41 3.47c3.9 1.29 4.51.54 4.36-5.32-.18-6.54-.09-6.54 2.29.07 1.36 3.79 3.09 13.6 3.85 21.81 1.43 15.38 2.89 19.93 4.7 14.66 1.76-5.1 11.36-7.43 14.55-3.53 1.66 2.02 2.6 7.04 2.1 11.15-1.57 12.88-1.68 14.84-1.27 24.35.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.86-13.51-7.07-14.21-20.04-3.33-13.5 11.33-18.29 13.61-39.95 19-18.04 4.49-22.02 3.76-13.44-2.48 3.01-2.18 6.44-2.8 7.61-1.36 1.18 1.44 3.09 1.84 4.24.9 2.88-2.36-5.43-12.04-9.84-11.45-1.96.26-3.17 2.67-2.69 5.35.47 2.68-.95 5.48-3.17 6.21-2.22.74-4.24-.17-4.48-2.01-.28-2.08-1.32-1.83-2.73.64-1.26 2.2-4.13 3.64-6.39 3.2-2.96-.57-2.79-2.01.63-5.17 3.19-2.94 6.34-3.33 9.62-1.19 4.5 2.93 4.81 2.76 3.94-2.13-.76-4.3-4.53-5.55-19.74-6.54-15.79-1.03-19.77-2.42-24.89-8.66-4.81-5.88-9.88-8.03-24.07-10.21-20.09-3.08-18.94-2.55-19.67-9.08zm124.31-31.92c1.08-.88 1.19-2.55.25-3.7-.94-1.15-3.18-.89-4.97.58-1.8 1.47-1.91 3.13-.26 3.7 1.66.57 3.89.31 4.98-.58zm28.41 22.16c2.3-1.89 3.46-4.31 2.57-5.4-2.3-2.8-7.72-1.66-8.94 1.88-1.75 5.08 1.96 7.13 6.37 3.52zm-135.65 27.94c.74-5.51 2.15-4.39 4.8 3.82 1.34 4.12.91 4.86-1.88 3.27-1.98-1.13-3.29-4.32-2.92-7.09zm-86.37-104.69c.51-.42 2.28-.29 3.93.28 1.65.56 2.01 1.85.79 2.84-1.22 1-2.99.87-3.93-.28s-1.3-2.43-.79-2.84zm-106.39-146.75c1.85-4.47 5.64-8.13 11.21-10.85 4.62-2.26 9.14-5.13 10.03-6.39 1.95-2.73 1.47 16.15-.58 22.77-2.15 6.96-8.02 11.53-10.67 8.3-1.28-1.57-3.28-2.08-4.43-1.14-4.14 3.39-8.3-6.09-5.56-12.69zm12.43 24.28c.22-.32 2.22-2.75 4.46-5.4 3.4-4.03 4.01-3.97 3.76.33-.16 2.83-1.31 4.54-2.55 3.82-1.25-.73-2.69-.09-3.21 1.42-.51 1.51-1.37 2.22-1.9 1.58-.52-.64-.78-1.43-.56-1.75zM358.307 443a2.72 2.72 0 0 1 3.81.38c.94 1.15.77 2.86-.38 3.8s-2.86.77-3.8-.38c-.95-1.15-.78-2.86.37-3.8zm-238.83-293.57c2.2-1.81 6.42 1.45 5.46 4.22-.57 1.68-2.25 1.59-3.72-.2-1.47-1.8-2.25-3.6-1.74-4.02zm192.8 225.27c1.85-.87 5.64-3.44 8.42-5.72 3.75-3.07 5.99-3 8.67.27 2.5 3.05 4.27 3.25 5.76.63 1.18-2.07 2.77-3.02 3.52-2.09 2.66 3.24.83 6.68-3.52 6.65-3.05-.02-4.27.99-3.96 3.27.24 1.82-1.39 4.8-3.62 6.63-3.09 2.53-5.26 1.87-9.06-2.78-2.75-3.35-6.02-5.91-7.28-5.69-1.26.23-.77-.3 1.07-1.17zM36.077 32.77c.93-3.51.6-6.76-.73-7.21-1.33-.46-.52-1.47 1.81-2.24 5.76-1.91 1.28-15.94-5.53-17.26-3.7-.72-4-1.53-1.36-3.7 6.17-5.05 14.78 7.86 13.01 19.51-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.34-2.74 38.14-.9 37.9 2-.12 1.37-4.69 2.05-10.16 1.5-5.47-.54-10.41.39-10.99 2.07-.58 1.68-1.81 1.59-2.74-.19-1.11-2.12-3.35-1.58-6.49 1.57-3.64 3.65-4.45 3.73-3.35.31 1.14-3.53-1.15-3.75-10.54-1-11.44 3.34-11.92 3.21-10.3-2.87zm194.26 239c1.73-1.41 3.88-1.65 4.8-.54.91 1.12-.2 2.64-2.47 3.39-2.26.75-4.42 1-4.79.55-.37-.46.74-1.98 2.46-3.4zm160.32 193.66c-.33-2.88.28-3.81 1.53-2.33 1.14 1.35 1.6 3.81 1.04 5.47-1.29 3.73-1.88 3-2.57-3.14zm-277.64-343.71c1.58-.21 1.49-2.1-.19-4.2-2.58-3.19-2.34-3.57 1.44-2.31 3.13 1.04 3.99 2.8 2.83 5.75-.91 2.34-.11 4.85 1.79 5.58 1.91.72 2.06 1.24.34 1.15-4.29-.22-9.78-5.5-6.21-5.97zm10.87 6.18c1.19-5.32 1.32-5.3 1.44.14.12 5.72-.69 8.24-2.1 6.52-.36-.44-.06-3.43.66-6.66zm119.98 137.23c2.36-1.65 4.43-1.94 4.61-.64.17 1.29-1.51 2.96-3.73 3.69-5.59 1.85-5.98.52-.88-3.05zm17.43 12.74c1.08-.89 5.13-2.66 8.99-3.96 7.65-2.55 11.87.7 13.08 10.06.7 5.47.14 6.04-6.69 6.77-7.43.79-19.61-9.41-15.38-12.87zM113.927 94.58c-2.97-8.57-1.25-16.6 3.55-16.57 2.52.01 5.02-1.24 5.55-2.79 1.29-3.75 11.33 3.89 13.44 10.23 2.71 8.14 1.5 12.96-3.93 15.56-10.17 4.89-15.3 3.12-18.61-6.43zm238.07 276.75c2.75-6.64 12.9-9.83 15.48-4.88 4.72 9.04 4.38 12.91-1.24 14.02-3.11.61-8.12.09-11.13-1.16-4.4-1.83-5.01-3.4-3.11-7.98zm-203.92-250.34c2.71-.9 4.82-.68 4.71.49-.12 1.17-2.33 1.91-4.92 1.64-3.74-.39-3.7-.82.21-2.13zm30.94 39.3c-1.06-8.7 9.66-5.57 18.28 5.33 4.27 5.4 6.07 8.84 4 7.65-2.07-1.19-7.35-2.98-11.72-3.98-9.04-2.06-9.79-2.7-10.56-9zm25.96 27.43c1.22-1 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.27.29-3.93-.28-1.65-.57-2-1.85-.79-2.85zm12.75 16.64c-2.23-4.85 1.86-9.75 6.74-8.08 1.67.58 3.39.06 3.81-1.17.42-1.22 3.95 1.24 7.85 5.47 8.57 9.29 7.69 13.45-3.12 14.6-7.84.83-10.94-1.36-15.28-10.82zM88.997 38c3.82-.83 6.84-.46 6.71.82-.13 1.27-3.25 1.95-6.94 1.49-6.41-.78-6.4-.89.23-2.31zm293.74 362.29c1.73-.23 3.87.47 4.76 1.55.89 1.08.67 2.74-.48 3.68s-3.29.24-4.76-1.55c-1.47-1.79-1.25-3.45.48-3.68zm-218.83-271.52c1.62-4.73 6.96-4.29 11.23.91 4.76 5.83 4.64 8.91-.42 10.58-5.22 1.73-7.64-1.8-6.2-9.05 1.14-5.73 1.06-5.82-1.53-1.87-2.96 4.53-4.72 4.21-3.08-.57zm165.5 194.02c2.22-12.44 14.98-5.17 17.76 10.12l1.31 7.23-7.46-2.1c-9.77-2.74-13.07-7.08-11.61-15.25zm44.3 59.63c1.27.13 2.82 1.87 3.45 3.88.7 2.21-.2 2.12-2.3-.23-1.89-2.13-2.41-3.77-1.15-3.65zm9.99 8.28c.85-4.39 1.27-4.51 2.52-.74.82 2.48.65 5.2-.38 6.04-2.69 2.21-3.3.69-2.14-5.3zm-165.09-203.65c1.15-.95 2.43-1.3 2.85-.79.41.5.29 2.27-.28 3.92-.57 1.66-1.85 2.01-2.85.79-.99-1.22-.87-2.98.28-3.92zm231.83 274.84c2.37-1.93 5.08-2.58 6.02-1.43.95 1.15.36 3.2-1.3 4.56-1.66 1.36-4.36 2-6.02 1.43-1.65-.56-1.06-2.62 1.3-4.56zm-149.87-194.05c1.44-1.18 3.44-.77 4.45.91 3.13 5.22 1.61 7.53-2.83 4.31-2.47-1.8-3.14-3.97-1.62-5.22zm99.2 120.88c-.4-5.29-1.82-7.7-4.88-8.3-2.38-.46-5.79-2.94-7.59-5.5-2.51-3.59-1.99-5.37 2.25-7.73 5.4-2.99 5.11-5.6-1.25-11.44-2.49-2.28-2.06-2.67 2.91-2.63 3.41.02 6.79 2.13 8.14 5.08 1.44 3.13 6.19 5.77 12.55 6.96l10.23 1.91 2.07 13.18c1.14 7.24 3.33 13.34 4.87 13.54 1.55.21-.37.82-4.25 1.36-3.88.54-7.64.27-8.35-.61-.72-.87-3.66.34-6.53 2.7-6.02 4.93-9.37 2.12-10.17-8.52zm24.17 4.04c.51-.42.15-1.7-.79-2.85-.94-1.15-2.71-1.28-3.93-.28-1.21 1-.86 2.28.79 2.85 1.66.57 3.42.69 3.93.28zm-6.11-19.02c.36-3.75-.08-3.79-2.13-.21-1.42 2.47-1.62 4.59-.45 4.71 1.17.11 2.33-1.91 2.58-4.5zm-98.75-86.92c1.1-5.63 8.93-8.84 12.11-4.95 1.24 1.51 4.03 3.76 6.21 5 6.85 3.91-.05 11.32-8.85 9.5-9.28-1.92-10.68-3.32-9.47-9.55zm-31.4-41.03c2.52.81 5.36 2.42 6.3 3.57.95 1.15-.35 1.43-2.88.61-2.53-.81-5.37-2.41-6.31-3.57-.94-1.15.36-1.42 2.89-.61zm24.79 22.11c-.43-3.19.42-3.56 3.79-1.64 5.24 2.99 5.37 4.61.44 5.27-2.13.29-3.91-1.24-4.23-3.63zm151.46 186.75c4.14-3.03 13.67-5.01 10.45-2.17-1.67 1.47-5.2 2.92-7.84 3.22-2.64.3-3.81-.18-2.61-1.05zm-105.35-143.7c-3.16-10.1 6.64-10.32 21.75-.5 4.61 2.99 10.94 18.22 8.42 20.28-3.02 2.47-11.09-.47-12.43-4.54-.74-2.22-3.78-4.05-6.77-4.06-6.07-.05-8.14-2.15-10.97-11.18zm13.95-14.68c1.67-1.37 3.2-1.29 3.4.18.19 1.47-.96 2.85-2.58 3.07-4.12.55-4.35-.36-.82-3.25zm66.44 59.95c.73-3.78 2.45-5.09 7.52-5.74 6.5-.84 12.68 4.2 15.46 12.59 1.3 3.91.55 4.47-7.55 5.72-9.79 1.5-17.02-4.39-15.43-12.57zm71.79 89.48c.57-1.65 1.85-2.01 2.85-.79.99 1.22.87 2.98-.28 3.93-1.15.94-2.43 1.29-2.85.79-.41-.51-.29-2.28.28-3.93z',
												fill: '#b64b25',
											}),
											Object(Ot.jsx)('path', {
												d: 'M79.027 238.45c1.15-.94 2.86-.77 3.8.38s.77 2.86-.38 3.81c-1.15.94-2.86.77-3.8-.38-.95-1.15-.77-2.87.38-3.81zm5.31-14.7c.15-5.39-1.46-9.6-4.41-11.53-3.04-1.98-3.45-3.18-1.19-3.48 2.16-.29 1.99-1.3-.46-2.69-2.14-1.22-5.21-1.15-6.81.16-3.88 3.17-8.44-2.74-7.72-9.99.36-3.62 2.42-6.33 5.47-7.19 2.69-.76 6.25-2.79 7.91-4.52 1.65-1.72 5.39-2.67 8.31-2.1 2.91.57 4.6 1.61 3.74 2.31-.86.7.77 1.73 3.62 2.28 2.84.55 6.79-.33 8.77-1.95 5.2-4.25 18.42-3.24 22.48 1.72 2.89 3.53 2.08 9.24-2.06 14.55-.47.6-1.72 3.4-2.78 6.22-1.67 4.43-.96 5.59 5.3 8.6 4.82 2.32 8.08 2.18 9.79-.42 3.97-6.05 19.99 11.4 17.42 18.98-2.25 6.65-11.14 10.66-14.51 6.54-1.35-1.65-3.75-1.94-5.33-.65-2.1 1.73-.52 4.96 5.94 12.13 4.84 5.38 10.37 10.32 12.29 10.98 4.1 1.41 11.97 15.8 8.87 16.21-1.16.15.13 3.01 2.87 6.36 3.96 4.83 5.9 5.31 9.5 2.36 2.5-2.04 4.05-5.28 3.45-7.19-.6-1.91.96-1.22 3.46 1.54 4.46 4.93 4.5 4.88 2.1-3.35-3.11-10.71 1.5-9.08 11.44 4.04 5.46 7.2 9.42 10.26 13.09 10.1 2.9-.13 7.27.92 9.7 2.34 3.23 1.87 5.52 1.11 8.45-2.83 4.34-5.84 11.27-5.4 10.66.68-.2 2.02-2.07 5.3-4.16 7.29-4.07 3.88.57 12.64 4.84 9.14 2.6-2.13 8.78.5 12.86 5.48 1.33 1.64.86 4.26-1.06 5.83-1.92 1.57-2.52 2.95-1.33 3.06 1.19.12 1.72 5.2 1.18 11.29-.84 9.57-.07 11.58 5.7 14.9 8.69 4.99 16.86 4.55 24.16-1.28 6.7-5.36 5.67-12.52-2.01-14.01-2.82-.55-4.43-1.57-3.57-2.28.85-.7-.71-1.71-3.47-2.25-6.67-1.29-7.08-6.58-.9-11.64 3.21-2.63 8.96-3.16 16.06-1.47 12.43 2.95 16.47 6.28 12.04 9.91-1.65 1.34-3.25 5.04-3.56 8.21-.52 5.15.35 6.13 8.11 9.15 7.2 2.8 8.45 4.08 7.31 7.5-1.87 5.59-10.42 9.21-13.34 5.64-3.46-4.22-6.59-.52-5.26 6.23 1.38 6.99 12.13 20.69 15.41 19.63 3.34-1.07 16.89 11.55 17.52 16.31.42 3.12-2.28 4.77-12.36 7.55-7.27 2.01-13.05 5.01-13.23 6.86-.19 1.86-7.07-5.25-15.76-16.27-15.24-19.32-24.93-26.32-23.83-17.22.28 2.27-.33 3.13-1.35 1.93-1.01-1.21-1.61-5.83-1.33-10.27.5-7.86-2.61-9.05-3.38-1.3-.57 5.77-14.72 2.83-20.53-4.26-2.64-3.23-3.72-6-2.41-6.18 1.31-.17 2.64-2.86 2.95-5.98.75-7.52-3.56-20.28-6.13-18.17-1.09.89-2.53-.04-3.2-2.07-.87-2.64-2.92-2.12-7.2 1.83-3.29 3.03-6.13 4.33-6.33 2.88-.19-1.45-1.32-1.84-2.51-.87-5.21 4.27-18.36-5.73-29.3-22.29-.62-.94.44-2.99 2.36-4.56 1.92-1.57 2.36-2.96.98-3.1-1.38-.14-2.49-2.37-2.47-4.97.02-2.59-.8-4.03-1.81-3.2-1.02.83-1.46 4.52-.99 8.21.52 4.03-.52 6.55-2.61 6.35-6.41-.64-14.01-12.06-22.7-34.08-1.69-4.3-3.18-5.26-5.36-3.47-1.66 1.36-5.47 2-8.46 1.42-4.5-.88-5.19-1.8-3.99-5.42.87-2.62.46-3.57-1.02-2.39-2.81 2.24-11.03-13.87-11.05-21.64-.01-5.02-12.55-8.26-16.01-4.15-1.16 1.37-5.2-.99-9.55-5.57-5.51-5.8-7.48-10.24-7.31-16.45zm-11.22-22.38a2.708 2.708 0 0 0-3.43-4.19 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm26.1 17.4c-1.67-8.04-1.38-12.69.74-11.96 5.38 1.85 9.23-2.83 6.76-8.21-4.9-10.69-20.26-3.28-19.31 9.31.3 4.02 3.69 11.07 7.54 15.66l6.99 8.35-2.72-13.15zm8.14-7.69c.12-1.17-2-1.39-4.7-.49-3.91 1.31-3.96 1.74-.22 2.13 2.59.27 4.81-.47 4.92-1.64zm95.62 123.28c.56-1.65.3-3.89-.58-4.97-.89-1.09-2.55-1.2-3.71-.26-1.15.94-.89 3.18.58 4.97 1.47 1.8 3.14 1.91 3.71.26zm4.16-12.84c6.44.64 9.82-2.84 8.02-8.26-1.82-5.5-15.72-7.72-17.41-2.79-1.51 4.38 3.67 10.48 9.39 11.05zm62.51 47.34c1.15-.95 1.32-2.66.38-3.81a2.708 2.708 0 0 0-3.8-.38 2.72 2.72 0 0 0-.38 3.81 2.708 2.708 0 0 0 3.8.38zM13.597 133.91c2.18-.72 3.54.31 3.58 2.73.05 2.15.72 5.73 1.51 7.97.79 2.24-.82 1.01-3.58-2.73-3.33-4.53-3.84-7.2-1.51-7.97zm14.23 20.68c-1.74-4.4-1.54-5.43.6-3.11 1.76 1.92 3.92 2.91 4.79 2.19 3.39-2.77-.32-13.8-8.2-24.38-4.54-6.08-7.43-11.73-6.42-12.56 1-.82.52-5.07-1.09-9.45-1.6-4.37-1.65-9.88-.11-12.24 1.54-2.36 3.39-8.58 4.11-13.83.72-5.24 1.63-9.15 2-8.69.38.46 2.92-3.36 5.65-8.48 5.08-9.56 17.78-18.38 20.93-14.53.92 1.12 2.1.8 2.63-.71 2.91-8.47 39.67-3.12 42.55 6.18.72 2.32.25 2.5-1.49.61-3.23-3.51-16.99-3.98-20.98-.71-1.67 1.37-1.63 3.31.08 4.3 12.69 7.35 13.51 8.67 10.66 17.1-1.57 4.65-3 9-3.19 9.65-.18.66 4.63 1.26 10.7 1.34 6.08.08 11.6.82 12.27 1.65.68.82 1.44 6.74 1.7 13.15l.47 11.65-4.12-7.89c-3.3-6.33-6.41-8.42-15.79-10.65-6.42-1.53-13.5-1.28-15.73.55-2.71 2.22-4.23 2.02-4.59-.61-.73-5.41-6.52 12.34-6.79 20.82-.15 4.62-2.58 8.49-7.41 11.82-3.95 2.73-6.69 6.35-6.08 8.04 1.59 4.44 18.81-7.77 20.58-14.58 1.1-4.26 2.59-5.56 6.38-5.53 3.84.02 4.82-.99 4.36-4.5-.36-2.74-1.62-4.15-3.19-3.57-1.43.53-3.33.07-4.23-1.03-.9-1.1 1.38-2.58 5.13-3.32 4.17-.82 6.03-.18 4.87 1.67-2.22 3.5 8.82 18.1 11.83 15.64 1.11-.91 2.64.19 3.39 2.46.86 2.61 2.6 3.12 4.72 1.37 3.76-3.07 4.19-2.84 6.24 3.35 2.33 7.06-4.01 9.6-10.55 4.23-5.16-4.23-6.74-4.16-10.6.46-3.66 4.38-4.82 4.55-6.03.9-1.43-4.32-4.22-3.65-11.62 2.77-1.32 1.14-3.02.18-3.79-2.15-1.11-3.34-2.23-3.07-5.35 1.27-2.17 3.02-5.23 6.57-6.8 7.88-5.04 4.21 6.7 4.78 15.45.74 9.66-4.47 15.09-.56 14.4 10.36-.29 4.5.01 8.84.67 9.64.65.8-1.29 4.19-4.33 7.52-3.77 4.13-6.24 5.18-7.79 3.28-1.25-1.52-3.21-2-4.36-1.06-1.15.94-.82 3.27.73 5.17 2.24 2.72 1.05 3.15-5.56 2.01-4.8-.82-7.71-2.54-6.78-4.01 2.49-3.94-1.88-7.73-11.31-9.82-9.23-2.05-9.71-2.48-13.61-12.36zm23.24 8.93c1.79-1.47 1.9-3.14.25-3.7-1.65-.57-3.89-.31-4.97.57-1.08.89-1.2 2.56-.26 3.71s3.18.89 4.98-.58zm14.08-.4c-.63-2-2.18-3.75-3.45-3.87-1.26-.13-.74 1.51 1.15 3.64 2.1 2.36 3 2.45 2.3.23zm-19.77-69.84c3.93-1.86 6.49-5.41 7.35-10.23 1.74-9.72-.19-11.58-6.58-6.35-4 3.28-4.34 5.39-1.43 9.04 3.41 4.29 3.27 4.57-1.4 2.82-2.86-1.07-5.63-.67-6.16.88-1.72 5 2.03 6.75 8.22 3.84zm35.5-19.96c.28-2.83-.76-2.43-3.5 1.33-2.22 3.05-2.39 4.78-.4 4.02 1.92-.74 3.68-3.14 3.9-5.35zm-79.5 44.23c-3.8-11.17 1.59-43.4 8.99-53.77 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-4.74-1.05-9.13-3.45-9.76-5.34-1.37-4.14 7.38-19.85 15.44-27.7 7.8-7.61 4.72.34-4.16 10.73-7.47 8.73-3.88 13.64 6.42 8.79 10.12-4.77 11.19 1.89 2.69 16.77-4.42 7.73-9 14.84-10.18 15.81-2.39 1.95-11.02 32.94-10.67 38.32.12 1.88 1.61 4.24 3.29 5.24 1.69.99 1.8 2.47.25 3.29-1.55.81-1.76 3.55-.47 6.08 1.35 2.65 2.79 3.32 3.39 1.59.62-1.8 1.98-.95 3.38 2.11 1.3 2.81 1.87 6.54 1.27 8.27-.69 2.01-1.69 1.33-2.75-1.89-.92-2.77-2.97-4.88-4.56-4.7-1.68.2-3.8-2.3-5.04-5.94zm15.13-73.85c9.43-.35 10.81-3.25 1.82-3.82-4.48-.29-8.33-1.86-8.54-3.48-.22-1.63-1.4-2.15-2.61-1.15-3.55 2.9 2.85 8.69 9.33 8.45zm193.92 300.28c2.74-2.24 11.13-.08 10.84 2.8-.52 5.21-5.96 6.91-9.25 2.89-1.89-2.3-2.6-4.86-1.59-5.69zm44.75 43.72c1.66-1.36 4.28-2.03 5.83-1.5 1.56.53.81 2.38-1.66 4.11-5.07 3.55-8.83 1.2-4.17-2.61zm-245-300.18c.14-1.39 1.22-3.33 2.41-4.3 1.31-1.07 1.99 0 1.72 2.73-.25 2.48-1.34 4.41-2.42 4.31-1.08-.11-1.85-1.34-1.71-2.74zm77.38 84.55a2.7 2.7 0 1 1 3.423 4.18 2.7 2.7 0 0 1-3.423-4.18zm40.4 36.79c1.22-.99 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.28.29-3.93-.28-1.65-.57-2.01-1.85-.79-2.85zm197.63 232.05c2.59.25 4.62 1.41 4.5 2.58-.11 1.17-2.23.97-4.71-.45-3.58-2.05-3.53-2.49.21-2.13zM81.267 138.79c1.15-.94 2.86-.77 3.8.38a2.69 2.69 0 0 1-.38 3.8c-1.15.94-2.86.77-3.8-.38s-.77-2.86.38-3.8zm242.71 292.14c1.73-.23 3.87.47 4.76 1.55.89 1.09.67 2.74-.48 3.68-1.15.95-3.29.25-4.76-1.54-1.47-1.8-1.25-3.45.48-3.69zm-160.31-204.21c3.96.19 7.39 1.95 7.64 3.89.28 2.27-.9 2.44-3.28.48-2.05-1.69-4.6-2.36-5.66-1.48-1.07.87-2.83.5-3.92-.83-1.13-1.38 1.11-2.26 5.22-2.06zm16.74 24.98c.52-1.51 2.01-2.09 3.32-1.29 1.53.95 2.89-.16 3.85-3.13 1.23-3.82.51-4.16-4.29-2.03-3.16 1.41-6.44 1.74-7.27.72-2.13-2.61 3.86-7.01 7.72-5.68 1.77.61 4.11-.46 5.2-2.38 1.11-1.95 4.64-2.37 8.03-.97 4.96 2.06 5.77 3.56 4.51 8.4-1.87 7.25-6.32 11.2-8.98 7.96-1.12-1.37-2.44.71-3.06 4.8-1.05 7.03-1.19 7.07-5.53 1.78-2.44-2.99-4.02-6.67-3.5-8.18zm171.2 197.51c.74-5.51 2.15-4.39 4.8 3.82 1.34 4.12.91 4.86-1.88 3.27-1.98-1.13-3.29-4.32-2.92-7.09zm-225.63-277.15c1.15-.95 2.43-1.3 2.85-.8.41.51.29 2.28-.28 3.93-.57 1.66-1.85 2.01-2.85.79-1-1.22-.87-2.98.28-3.92zm7.4 10.31c.46-1.34 3.85-4.07 7.53-6.07 5.21-2.83 6.68-2.61 6.66 1-.02 2.55-2 5.29-4.41 6.09-3.1 1.02-3.23 1.83-.46 2.79 2.62.9 2.69 1.8.2 2.75-4.22 1.61-10.78-2.91-9.52-6.56zm131.86 162.15c.51-.42 2.28-.29 3.93.28 1.65.56 2.01 1.85.79 2.84-1.22 1-2.99.87-3.93-.28s-1.3-2.43-.79-2.84zm66.13 79.49c-5.15-8.09-2.61-12.49 6.66-11.57 7.58.75 10.28-1.8 8.96-8.49-.75-3.8-3.25-6.43-8.09-8.51-6.59-2.84-6.67-3.2-1.39-6.06 3.09-1.68 7.66-1.73 10.14-.1 2.49 1.62 4.93 1.77 5.43.34.49-1.44 2.31-.59 4.04 1.88 1.72 2.47 2.3 5.18 1.27 6.02-1.03.84-.43 2.31 1.34 3.27 1.76.96 5.2 2.83 7.64 4.17 3.28 1.81 3.46 4.13.68 8.97-4.39 7.65-2.09 11.29 10.13 15.99 9.94 3.83 12.41 2.8 15.05-6.27.99-3.41 3.81-8.57 6.25-11.45 3.63-4.28 5.21-4.41 8.64-.72 2.31 2.49 3.54 4.95 2.73 5.47-5.1 3.3-7.67 12.25-5.09 17.73 3.85 8.17 6.53 8.21 19.15.27 6.55-4.12 8.61-6.24 5.69-5.86-6.67.86-7.39-9.53-1.03-14.74 4.12-3.37 6.24-2.96 12.04 2.37 9.7 8.9 18.35 4.11 14.01-7.75-2.11-5.77-1.73-8.61 1.28-9.6 2.78-.92 3.31-2.6 1.53-4.78-3.25-3.97-4.32-3.35-7.53 4.38-1.91 4.62-2.62 5.01-3.43 1.94-.56-2.13-1.79-6-2.72-8.59-1.83-5.04 2.02-9.88 6.6-8.3 1.52.52 8.1 7.27 14.63 14.99l11.85 14.05-.04-8.11c-.03-4.46-1.07-9.36-2.33-10.89-1.25-1.53-1.79-4.19-1.2-5.91 1.52-4.42 7.92 9.77 7.28 16.15-.41 4.18.98 5.68 8.19 8.79l8.68 3.75-.25-8.26c-.14-4.54-1.28-12.52-2.54-17.74-1.25-5.22-1.88-9.82-1.39-10.22 1.82-1.48 5.16 12.3 6.5 26.81 1.43 15.38 2.89 19.93 4.7 14.66 1.76-5.1 11.36-7.43 14.55-3.53 1.66 2.02 2.6 7.04 2.1 11.15-1.57 12.88-1.68 14.84-1.27 24.35.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.86-13.51-7.07-14.21-20.04-3.33-6.19 5.19-13.97 10.66-17.28 12.15-8.44 3.79-39.09 11.24-40.34 9.81-2.33-2.69 8.98-8.39 12.7-6.4 6.04 3.24 29.81-7.17 45.25-19.81l13.63-11.16 5.03 8.68c3.63 6.26 5.15 7.52 5.45 4.54.22-2.28-1.66-6.67-4.18-9.75-3.26-3.98-3.39-5.22-.44-4.27 3.44 1.11 4.06.51 3.64-3.49-.47-4.46 1.9-3.95 4.64 1 .64 1.16 2.19.3 3.44-1.91 1.33-2.31 2.46-2.69 2.7-.89.66 4.93 6.42-1.24 6.46-6.92.04-6.32-4.94-8.33-10.13-4.09-2.14 1.75-5.9 3.85-8.35 4.66-4.09 1.36-4.44.91-4.13-5.35.32-6.53.06-6.62-5.94-2.1-3.87 2.92-5.13 3.18-3.3.66 1.64-2.24 1.78-4.82.32-5.75-4.71-2.97-7.87.11-9.04 8.81-.64 4.68-3.98 11.07-7.42 14.22-3.45 3.15-7.25 7.71-8.44 10.15-4.76 9.67-53.73 14.78-60.65 6.32-.89-1.09-4.46-.64-7.92.99-3.47 1.64-7.72 1.55-9.45-.19-1.72-1.75-5.47-5.64-8.32-8.67-6.52-6.91-18.32-11.94-21.65-9.21-5.66 4.63-16.59-1.64-24.47-14.03zm178.47 40.11c6.18 1.6 6.32 1.46 7.5-7.51 1.43-10.91-1.71-19-6.73-17.34-3.9 1.29-4.45 6.32-1.59 14.36 1.47 4.12.84 5.03-3.43 5-6.64-.04-4.01 3.36 4.25 5.49zm-351.08-264.54c.76-5.05 3.13-8.03 8.59-10.8 9.3-4.72 12.62-3.76 13.61 3.98 1.49 11.6-2.02 16.65-11.72 16.84-10.63.21-11.84-.94-10.48-10.02zM358.307 443a2.72 2.72 0 0 1 3.81.38c.94 1.15.77 2.86-.38 3.8s-2.86.77-3.8-.38c-.95-1.15-.78-2.86.37-3.8zm-238.83-293.57c2.2-1.81 6.42 1.45 5.46 4.22-.57 1.68-2.25 1.59-3.72-.2-1.47-1.8-2.25-3.6-1.74-4.02zm56.89 66.82c1.72-4.99 3.78-3.46 2.98 2.21-.4 2.8-1.48 4.17-2.4 3.04-.92-1.12-1.18-3.49-.58-5.25zM24.517 16.02c8.34-9.92 10.98-9.66 5.51.55-2.9 5.41-5.51 7.84-8.15 7.58-2.63-.27-1.79-2.87 2.64-8.13zm205.82 255.75c1.73-1.41 3.88-1.65 4.8-.54.91 1.12-.2 2.64-2.47 3.39-2.26.75-4.42 1-4.79.55-.37-.46.74-1.98 2.46-3.4zm88.33 106.74c-4.25-7.38 5.4-15.73 10.7-9.26 2.5 3.05 4.27 3.25 5.76.63 1.18-2.07 2.77-3.02 3.52-2.09 2.68 3.26.82 6.68-3.61 6.65-3.17-.02-5.18 1.64-6.84 5.64-2.69 6.47-5.12 6.07-9.53-1.57zm71.99 86.92c-.33-2.88.28-3.81 1.53-2.33 1.14 1.35 1.6 3.81 1.04 5.47-1.29 3.73-1.88 3-2.57-3.14zM38.957 24.68c1.48-5.96.52-10.75-3.14-15.57-5.01-6.6-4.83-12.25.23-7.11 6.36 6.45 8.41 12.09 7.23 19.87-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.16-2.6 38.14-.98 37.92 1.75-.1 1.23-8.12 1.62-17.83.86-9.7-.76-20.87.34-24.81 2.43-8.87 4.72-11.86 1.51-9.07-9.74zm72.41 89.46c.46-.37 2.52.29 4.6 1.48 2.07 1.18 2.86 2.89 1.74 3.81-1.11.91-3.18.24-4.59-1.48-1.41-1.73-2.2-3.44-1.75-3.81zm297.85 354.82c3.19-2.94 6.65-3.13 11.44-.63 6.02 3.15 6.14 3.43.99 2.29-3.23-.72-7.36-.08-9.18 1.4-5.31 4.36-8.26 1.58-3.25-3.06zm-165.35-203.83c2.36-1.65 4.43-1.94 4.61-.64.17 1.29-1.51 2.96-3.73 3.69-5.59 1.85-5.98.52-.88-3.05zm17.15 12.97c5.54-4.54 17.62-5.03 20.2-.82 3.52 5.73-4.06 15.41-8.15 10.41-1.48-1.81-3.63-2.51-4.78-1.57-1.15.94-3.63-.17-5.52-2.47-1.88-2.3-2.67-4.8-1.75-5.55zM114.967 95.81c-1.23-2.65-2.02-8.14-1.76-12.2.42-6.65.89-7.16 4.64-5.02 2.29 1.31 5.38 1.38 6.86.17 4.55-3.72 10.26 1.71 11.45 10.89.76 5.93-.43 9.58-3.73 11.35-5.35 2.88-13.09 3.49-14.39 1.13-.45-.83-1.84-3.67-3.07-6.32zm235.42 278.9c.46-4.57 5.88-6.75 8.58-3.44 2.28 2.77 2.96 2.45 3.79-1.78.82-4.23 1.49-4.58 3.68-1.91 3.54 4.32 1.77 8.87-4.41 11.33-5.27 2.1-12.02-.34-11.64-4.2zm-171.63-213.56c-.6-1.91-.12-4.26 1.06-5.23 1.17-.96 2.75.09 3.49 2.34.78 2.36 2.26 3 3.49 1.51 1.22-1.48 4.22-.2 7.05 3 5.95 6.75 4.02 8.98-5.46 6.32-7.48-2.1-7.92-2.46-9.63-7.94zm26.22 26.57c1.22-1 2.99-.87 3.93.28s1.3 2.43.79 2.85c-.51.41-2.27.29-3.93-.28-1.65-.57-2-1.85-.79-2.85zm14.34 17.9c-2.53-6.46.32-9.14 8.83-8.29 8.91.88 16.35 10.44 11.34 14.55-3.42 2.8-16.21 2.89-17.56.13-.28-.58-1.46-3.45-2.61-6.39zm9.6 4.43c.51-.42.15-1.7-.79-2.85-.94-1.15-2.71-1.27-3.93-.28-1.22 1-.86 2.28.79 2.85 1.65.57 3.42.69 3.93.28zm154.68 191.29a2.69 2.69 0 0 1 3.8.38c.94 1.15.77 2.86-.38 3.8s-2.86.77-3.8-.38a2.69 2.69 0 0 1 .38-3.8zM89.157 37.99c1.15-.94 3.45-1.25 5.1-.68 1.65.57 2.06 1.81.91 2.75s-3.44 1.24-5.09.68c-1.66-.57-2.07-1.81-.92-2.75zm74.82 90.58c.6-1.76 2.17-3.1 3.49-2.97 4.02.4 8.46 5.55 6.31 7.32-1.12.91-.68 2.13.97 2.69 1.65.57 1.54 2.24-.25 3.71-3.91 3.19-6.82-1.33-5.64-8.77.75-4.7.52-4.85-1.87-1.21-3.02 4.61-4.72 4.18-3.01-.77zm273.63 336.85c.5-.42 2.27-.29 3.92.28 1.66.56 2.01 1.85.8 2.84-1.22 1-2.99.88-3.93-.27-.94-1.16-1.3-2.44-.79-2.85zm-106.82-141.31c-.92-8.68-.8-8.83 4.88-6.47 7.86 3.26 10.5 6.91 10.72 14.8.15 5.59-.09 5.89-1.56 1.89-1.25-3.43-2.31-3.71-3.85-1-3.34 5.84-9.15.57-10.19-9.22zm52.91 66.59c.85-4.39 1.27-4.51 2.52-.74.82 2.48.65 5.2-.38 6.04-2.69 2.21-3.3.69-2.14-5.3zm-165.09-203.65c1.15-.95 2.43-1.3 2.85-.79.41.5.29 2.27-.28 3.92-.57 1.66-1.85 2.01-2.85.79-.99-1.22-.87-2.98.28-3.92zm233 273.89c1.73-1.42 3.91-1.63 4.85-.48.95 1.15.3 3.25-1.42 4.66-1.73 1.41-3.91 1.63-4.85.48-.94-1.15-.3-3.25 1.42-4.66zm-151.09-193.06c1.46-1.19 3.49-.09 4.7 2.56 1.18 2.56 1.89 4.86 1.58 5.11-.3.25-2.42-.9-4.7-2.56-2.35-1.71-3.03-3.92-1.58-5.11zm100.82 122.42c-.82-4.13-3.89-9.48-6.82-11.89-6.1-5.02-7-9.99-2.48-13.69 1.75-1.42 1.63-4.13-.25-6.08-1.86-1.93-1.99-4.01-.29-4.62 1.71-.61 5.08 1.71 7.49 5.16 2.87 4.09 6.62 6.1 10.85 5.78 6.93-.52 12.71 4.74 14.35 13.06.76 3.82-1.52 7.08-8.91 12.75-5.45 4.19-10.49 7.48-11.18 7.32-.69-.15-1.93-3.66-2.76-7.79zm15.8-12c.69-3.85.44-7.96-.54-9.13-.99-1.17-1.55.03-1.25 2.67.29 2.64-.26 3.88-1.24 2.76s-1.53.12-1.23 2.76c.89 7.94 2.93 8.39 4.26.94zm-98.23-91.28c.62-6.22 4.29-8.32 4.25-2.43-.02 4.09.58 4.16 3.35.34 2.88-3.96 4.18-3.68 8.72 1.87 3.39 4.14 4.29 7.38 2.46 8.88-5.6 4.58-19.46-1.81-18.78-8.66zm145.02 167.63c4.14-3.03 13.67-5.01 10.45-2.17-1.67 1.47-5.2 2.92-7.84 3.22-2.64.3-3.81-.18-2.61-1.05zm-152.43-189.93c.44-.37 2.84.82 5.32 2.63 2.49 1.81 3.24 3.46 1.67 3.67-2.74.36-8.64-4.95-6.99-6.3zm108.26 127.97c.43-.36 3.43-.06 6.66.66 5.31 1.19 5.3 1.32-.15 1.44-5.72.12-8.23-.69-6.51-2.1zm-60.23-80.83c-1.41-8.79 3.91-10.25 13.59-3.72 9.18 6.19 18.61 20.15 15.4 22.78-2.41 1.97-11.28-2.11-12.57-5.78-.58-1.64-3.48-3-6.44-3.02-6.22-.04-8.77-2.66-9.98-10.26zm12.15 6.65c1.73-.23 2.38-1.36 1.43-2.51-.94-1.15-3.13-1.9-4.86-1.67-1.73.23-2.38 1.36-1.44 2.51.95 1.15 3.13 1.9 4.87 1.67zm11.03 4.94c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.94-1.27 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm56.72 34.79c-.48-2.97.07-6.18 1.23-7.12 2.91-2.39 19.62 6.88 21.24 11.8 1.16 3.48.12 4.24-7.62 5.56-9.37 1.59-13.4-1.18-14.85-10.24zm45.35 30.12c6 1.93 8.26 4.7 4.28 5.23-1.74.23-4.44-1.18-6.02-3.14-2.46-3.07-2.23-3.36 1.74-2.09z',
												fill: '#b44b1b',
											}),
											Object(Ot.jsx)('path', {
												d: 'M84.647 223.56c.04-4.72-1.77-9.92-4.02-11.56-2.24-1.63-2.8-3.14-1.23-3.35 5.2-.7 1.2-2.55-6.57-3.05-6.68-.43-7.76-1.34-8.51-7.18-.53-4.12.76-7.19 3.35-7.97 2.31-.69 6.62-3.03 9.58-5.18 3.78-2.76 6.98-2.69 10.81.25 3.9 2.98 7.62 3.01 13.12.12 18.66-9.82 31.76 2.11 19.21 17.48-7.01 8.58 2.31 18.61 13.73 14.79 13.04-4.36 23.93 19 11.22 24.06-2.81 1.12-7.11.58-9.55-1.2-2.45-1.77-5.59-2.29-6.99-1.15-2.57 2.11 13.41 20.09 24.44 27.51 2.82 1.89 4.76 5.53 4.54 8.51-.21 2.86 1.71 7.82 4.25 11.02 3.67 4.61 5.58 5.03 9.24 2.04 2.54-2.08 4.13-5.35 3.53-7.26-.6-1.91.99-1.25 3.53 1.48l4.61 4.96-2.62-7.49c-1.44-4.12-1.32-7.66.27-7.87 3.8-.51 11.31 8.79 10.05 12.45-2.46 7.16 27.4 15.69 31.72 9.06 3.99-6.12 9.81-3.28 7.95 3.9-.85 3.28-2.43 6.08-3.5 6.22-4.14.55 7.88 9.63 13.49 10.19 5.35.53 5.87 1.23 5.43 7.32-.58 8.26-.53 18.96.14 23.92.63 4.73 15.66 11.31 22.39 9.79 7.21-1.62 13.83-11.54 11.09-16.61-1.27-2.34-5.34-5.22-9.06-6.41-3.71-1.19-7.31-3.66-8-5.51-1.51-4.05 6.03-10.81 8.59-7.69.99 1.21 2.24.96 2.76-.56.98-2.84 18.3.68 21.28 4.31 2.46 3.01-6.66 8.72-11.34 7.11-2.5-.86-1.13 1.81 3.56 6.91 4.19 4.57 9.57 8.51 11.95 8.74 6.05.61 8.82 4.72 6.24 9.26-1.22 2.12-5.66 3.48-10 3.05-4.32-.43-8.79.92-9.99 3.03-2.22 3.89 6.03 13.66 25.82 30.61 9.92 8.49 7.55 13.82-8.02 18-12.77 3.44-16.82 1.16-27.93-15.68-5.07-7.69-11.1-13.88-16.16-16.59-6.76-3.62-7.85-5.03-6.73-8.7.93-3.02-.04-2.58-3.12 1.42-3.41 4.42-6.13 5.33-11.45 3.83-8.5-2.38-10.64-7.75-8.26-20.69 1.74-9.46-2.36-19.4-6.57-15.95-1.12.91-2.71-.4-3.54-2.92-.96-2.9-1.92-3.38-2.63-1.33-2.2 6.41-10.12 6.6-13.08.32-1.57-3.35-3.74-5.2-4.94-4.22-1.17.96-.97 3.16.44 4.88 1.41 1.73 1.69 3.86.62 4.74-2.66 2.17-9.89-2.84-15.34-10.63-2.47-3.55-9.2-9.75-14.95-13.78-8.78-6.16-11.55-9.71-17.26-22.14l-6.81-14.81-8.69.17c-6.72.13-8.39-.75-7.35-3.88.88-2.66.49-3.38-1.13-2.09-2.81 2.24-11.03-13.87-11.05-21.64-.01-5.08-12.36-8.16-17.11-4.27-4.5 3.69-15.53-12.07-15.45-22.09zm-11.53-22.19a2.708 2.708 0 0 0-3.43-4.19 2.72 2.72 0 0 0-.38 3.81 2.72 2.72 0 0 0 3.81.38zm26.36 18.13c-2.08-10.47-1.62-12.52 2.97-13.04 6.23-.71 6.78-2.26 3.13-8.77-1.71-3.06-5.18-4.13-10.07-3.11-6.75 1.4-7.5 2.43-7.79 10.75-.24 6.52 1.79 11.73 6.94 17.89l7.28 8.7-2.46-12.42zm77.21 92.71c1.92-1.57 2.36-2.96.98-3.1-1.38-.14-2.49-2.37-2.47-4.97.02-2.59-.69-4.12-1.56-3.4-1.34 1.09-1.96 11.89-.8 13.75.2.32 1.93-.71 3.85-2.28zm-69.33-101.13c.12-1.17-2-1.39-4.7-.49-3.91 1.31-3.96 1.74-.22 2.13 2.59.27 4.81-.47 4.92-1.64zm104.23 109.21c3.55-.99 6.97-.18 7.63 1.8.66 1.98 1.65 2.26 2.21.63 1.49-4.32-7.41-14.22-14.4-16.03-3.82-.99-6.91.02-8.47 2.75-3.44 6.03 5.04 13.09 13.03 10.85zm58.06 48.57c1.15-.95 1.32-2.66.38-3.81a2.708 2.708 0 0 0-3.8-.38 2.72 2.72 0 0 0-.38 3.81 2.708 2.708 0 0 0 3.8.38zM1.247 117.65c-3.63-11.57 1.79-43.59 9.12-53.87 3.77-5.29 7.81-10.99 8.97-12.68 1.59-2.31-.03-3.54-6.5-4.98-10.98-2.43-12.22-6.48-5.52-18.06 5.98-10.36 19.3-24.55 14.4-15.34-1.52 2.85-5.88 9.52-9.69 14.84-7.72 10.77-5.48 17.43 5.4 16.03 8.54-1.1 8.68 3.08.48 14.52-9.76 13.63-16.61 40.74-13.55 53.65 1.43 6.01 1.89 11.52 1.04 12.24-1.8 1.52-1.56 1.88-4.15-6.35zm32.5 33.51c.16-6.52-1.84-12.91-5.41-17.27-13.46-16.45-13.3-43.57.39-68.92 4.73-8.75 18.66-18.77 21.42-15.39.89 1.08 2.04.73 2.57-.78 2.91-8.47 39.67-3.12 42.55 6.18.72 2.32.25 2.5-1.49.61-3.23-3.51-16.99-3.98-20.98-.71-1.67 1.37-1.63 3.31.08 4.3 12.69 7.35 13.51 8.67 10.66 17.1-1.57 4.65-3.01 9.1-3.21 9.89-.2.78 5.02 1.47 11.6 1.54l11.96.11 1.92 18.64-6.54-5.29c-7.26-5.87-24.18-9.73-28.21-6.43-1.42 1.16-3.78 1.36-5.25.43-1.49-.94-4.31 5.29-6.41 14.15-2.61 11.01-5.34 16.46-8.97 17.9-6.17 2.46-8.37 10.62-4.21 15.7 3.5 4.27 14.99 5.31 19.34 1.74 6.91-5.66 11.9-2.08 14.03 10.07 1.63 9.23.82 12.71-3.83 16.52-3.24 2.65-6.66 3.88-7.6 2.73a2.708 2.708 0 0 0-3.8-.38c-1.15.94-.91 3.16.54 4.93 2.11 2.58 1.67 3.16-2.25 2.9-2.69-.17-6.24-2.82-7.91-5.88-1.66-3.06-6.44-6.64-10.62-7.96-9.98-3.14-10.66-4.22-10.37-16.43zm17.32 12.36c1.79-1.47 1.9-3.14.25-3.7-1.65-.57-3.89-.31-4.97.57-1.08.89-1.2 2.56-.26 3.71s3.18.89 4.98-.58zm14.08-.4c-.63-2-2.18-3.75-3.45-3.87-1.26-.13-.74 1.51 1.15 3.64 2.1 2.36 3 2.45 2.3.23zm-18.63-65.08c4.38-4.95 8.04-18.49 6.26-23.15-2.03-5.34-15.52 10.84-15.12 18.15.42 7.57 4.53 9.89 8.86 5zm34.36-24.72c.28-2.83-.76-2.43-3.5 1.33-2.22 3.05-2.39 4.78-.4 4.02 1.92-.74 3.68-3.14 3.9-5.35zm130.63 271.57c1.35-3.93 7.61-1.01 7.18 3.35-.24 2.43-1.71 2.96-4.23 1.52-2.13-1.21-3.45-3.4-2.95-4.87zM66.717 120.98c1.41-4.09 10.33-7.43 14.09-5.27 5.55 3.19 7.63 14.3 3.14 16.73-2.34 1.26-5.14 1.21-6.22-.12-1.09-1.32-3.26-2.53-4.83-2.69-4.06-.41-7.4-5.08-6.18-8.65zm115.29 131.24c6.27-3.91 7.41-6.57 3.73-8.67-3.29-1.88-2.77-2.49 3.51-4.15 10.54-2.79 15 .79 11.03 8.85-2.63 5.35-4.18 6.52-7.25 5.46-2.79-.96-3.77-.33-3.44 2.2.26 1.94-.84 3.71-2.46 3.93-4.35.58-8.47-5.54-5.12-7.62zM14.947 34.92c7.75-4.2 15.73-3.17 14.01 1.82-.66 1.93-5.42 3.04-10.72 2.52l-9.53-.95 6.24-3.39zm118.72 146.58c.63-1.82 3.19-3.29 5.7-3.27 2.51.02 4.76-1.3 5-2.92.25-1.63.73-1.22 1.08.89.35 2.12-.78 5-2.5 6.42-1.8 1.47-1.69 3.06.26 3.73 2.06.71 1.94 1.72-.31 2.58-4.68 1.79-10.72-3.07-9.23-7.43zm199.51 244.52c-3.63-5.52-3.83-8.22-.8-10.7 2.23-1.82 4.82-2.37 5.76-1.22 2.87 3.49 10.69-4.85 10.35-11.04-.22-4.07-1.89-6.46-5.56-7.98-7.92-3.29-6-5.49 4.08-4.69 9.61.77 15.39 3.84 12.18 6.47-1.08.89 1.14 4.35 4.92 7.69 5.78 5.11 6.33 6.86 3.43 10.85-3.82 5.25.32 12.41 7.58 13.14 2.51.25 3.84 1.05 2.95 1.77-.88.73.96 1.58 4.1 1.89 7.38.74 10.66-2.11 11.89-10.29.83-5.51 2.26-6.94 8.55-8.61 7.26-1.92 7.5-1.75 6.06 4.22-.82 3.42-2.55 7.12-3.83 8.23-3.23 2.8 3.05 15.27 7.93 15.76 2.19.22 8.06-2.61 13.05-6.29 5.91-4.35 7.52-6.48 4.64-6.11-6 .77-7.34-9.07-2.04-14.92 2.97-3.27 5.31-3.14 9.99.55 10.61 8.38 11.92 8.82 16.06 5.43 2.61-2.14 3-6.16 1.1-11.35-2.07-5.65-1.67-8.46 1.33-9.45 2.78-.92 3.31-2.6 1.53-4.78-3.25-3.97-4.32-3.35-7.53 4.38-1.91 4.62-2.62 5.01-3.43 1.94-.56-2.13-1.79-6-2.72-8.59-1.83-5.04 2.02-9.88 6.6-8.3 1.52.52 8.1 7.27 14.63 14.99l11.85 14.05-.04-8.11c-.03-4.46-1.07-9.36-2.33-10.89-1.25-1.53-1.79-4.19-1.2-5.91 1.48-4.29 7.93 9.68 7.31 15.84-.26 2.6-.17 5.75.2 6.99 2.17 7.37-6.15 24.36-16.83 34.37-10.52 9.86-13.15 11.02-29.27 12.91-9.73 1.15-21.28.96-25.66-.42-4.38-1.38-12.9-3-18.93-3.6-7.96-.79-11.56-2.59-13.14-6.56-2.26-5.68-24.6-14.58-28.52-11.37-3.2 2.62-10.99-2.32-16.24-10.29zM96.957 125.94c5.69-4.66 5.97-4.6 8.1 1.82 2.5 7.56-7.08 10.1-12.62 3.34-.39-.48 1.64-2.8 4.52-5.16zm63.24 72.62c3.7-6.49 14.68-14.48 15.14-11.02.23 1.73 1.43 2.32 2.65 1.32 3.03-2.48 4.33 8.15 1.88 15.38-1.52 4.48-3.35 5.3-9.84 4.42-9.57-1.3-12.9-4.71-9.83-10.1zM23.967 19.29c1.54-2.56 3.2-5.62 3.68-6.79s1.64-1.2 2.57-.06c1.97 2.41-3.69 12.04-6.88 11.72-1.19-.11-.9-2.31.63-4.87zm14.99 5.39c1.48-5.96.52-10.75-3.14-15.57-5.01-6.6-4.83-12.25.23-7.11 6.36 6.45 8.41 12.09 7.23 19.87-.96 6.27-.18 8.62 2.96 8.93 2.34.23 5.27-.41 6.51-1.42 3.16-2.6 38.14-.98 37.92 1.75-.1 1.23-8.12 1.62-17.83.86-9.7-.76-20.87.34-24.81 2.43-8.87 4.72-11.86 1.51-9.07-9.74zm280.67 345.18c3.29-2.69 5.09-2.29 7.5 1.69 4.7 7.76-1.8 14.1-7.42 7.24-3.31-4.05-3.33-6.27-.08-8.93zm-55.71-88.22c-1.27-2.42-.79-4.78 1.07-5.24 1.86-.46 5.57-1.63 8.24-2.61 6.96-2.53 11.96 6.93 6.69 12.66-2.72 2.95-5.05 3.44-6.71 1.41-1.4-1.71-3.54-2.81-4.76-2.46-1.21.36-3.25-1.33-4.53-3.76zm174.98 190.43c15.22-3.33 21.74-6.43 36.71-17.43l18.21-13.37 3.53 6.25c1.95 3.44 4.1 8.21 4.77 10.59.68 2.38 4.11 5.08 7.62 5.99 6.3 1.63 6.41 1.52 7.64-7.84.69-5.22.27-10.68-.93-12.14-1.2-1.47-.6-6.02 1.32-10.13 4.37-9.34.32-14.87-7.4-10.1-9.92 6.12-11.96 3.69-12.66-15.12-.38-10.01-1.6-19.33-2.71-20.71-1.12-1.37-1.57-3.84-1.01-5.49 1.66-4.82 5.21 8.26 6.74 24.86 1.43 15.38 2.89 19.93 4.7 14.66 1.76-5.1 11.36-7.43 14.55-3.53 1.66 2.02 2.6 7.04 2.1 11.15-1.57 12.88-1.68 14.84-1.27 24.35.45 10.58-3.39 14.91-12.81 14.44-6-.3-6.68-1.03-8.4-9.16-2.86-13.51-7.07-14.21-20.04-3.33-6.19 5.19-13.97 10.66-17.28 12.15-9.38 4.21-39.16 11.17-40.6 9.48-.71-.83 7.03-3.33 17.22-5.57zM114.877 95.63c-3.72-7.95-.91-14.57 7.08-16.68 9.54-2.51 15.45 6.99 10.66 17.17-2.79 5.94-4.68 7.58-8.66 7.56-2.79-.02-5.46-.72-5.92-1.55-.45-.83-1.88-3.75-3.16-6.5zm63.88 65.52c-.6-1.91-.25-4.16.77-4.99 1.02-.83 2.53.54 3.36 3.06 1.02 3.07 1.91 3.42 2.73 1.06.66-1.94 1.95-2.86 2.86-2.05 11.79 10.52 11.76 14.19-.09 10.86-7.48-2.1-7.92-2.46-9.63-7.94zm176.69 211.99c1.67-1.37 3.76-1.58 4.66-.48.9 1.1 2.13-.51 2.72-3.57.94-4.84 1.43-4.95 3.65-.83 3.43 6.35-2.01 12.35-8.69 9.58-4.11-1.71-4.66-2.8-2.34-4.7zm-136.85-168.62c-2.72-6.22-2.62-6.36 3.06-4.25 4.18 1.56 5.16 1.27 3.39-1.03-2.2-2.86-1.96-3.05 2.12-1.74 6.92 2.23 14.55 12.55 11.27 15.23-2.63 2.16-15.38 1.6-16.51-.72-.28-.58-1.78-3.95-3.33-7.49zm10.32 5.53c.51-.42.15-1.7-.79-2.85-.94-1.15-2.71-1.27-3.93-.28-1.22 1-.86 2.28.79 2.85 1.65.57 3.42.69 3.93.28zm-59.57-78.6c.53-1.54 2.34-2.33 4.02-1.75 1.68.58 2 1.91.71 2.97-1.28 1.05-.98 2.38.67 2.94 1.65.57 2.01 1.85.79 2.85-2.73 2.24-7.51-3.17-6.19-7.01zm161.68 190.43c2.03-10.47 15.02-1.53 15.36 10.56.15 5.59-.09 5.89-1.56 1.89-1.3-3.56-2.3-3.73-4.04-.68-3.13 5.49-11.22-4.27-9.76-11.77zm-11.11-33.51c3.25-5.59 10.07-5.81 15.57-.5 6.05 5.85 2.85 10.85-5.86 9.16-4.13-.8-5.16-2.08-5.13-6.35.03-4.48-.35-4.68-2.32-1.22-1.3 2.27-2.74 3.65-3.21 3.08-.47-.58-.04-2.45.95-4.17zm81.89 100.9c-.45-2.86-3.63-8.12-7.05-11.69-5.3-5.52-5.55-7.01-1.64-10.01 3.59-2.76 3.6-4.52.02-8.02-2.7-2.65-3.34-4.92-1.56-5.56 1.66-.6 5 1.74 7.41 5.19 2.87 4.09 6.62 6.1 10.85 5.78 6.84-.52 13.53 5.66 14.48 13.37.35 2.92-2.94 7.56-8.91 12.53-9.62 8.02-12.11 7.73-13.6-1.59zm14.21-6.63c-.59-1.91.25-4.57 1.88-5.9s1.6-4.06-.07-6.06c-2.58-3.11-2.95-2.94-2.48 1.16.29 2.64-.26 3.88-1.24 2.76s-1.53.12-1.23 2.76c.29 2.64 1.37 5.69 2.38 6.78 1.02 1.09 1.36.42.76-1.5zm-103.6-117.74c1.27.13 2.82 1.87 3.45 3.88.7 2.21-.2 2.12-2.3-.23-1.89-2.13-2.41-3.77-1.15-3.65zm47.13 47.09c-.47-2.9.92-5.86 3.07-6.58 5.46-1.8 19.77 7.81 22.51 15.13 1.25 3.33 3.03 6.61 3.97 7.29.93.67.79 1.97-.32 2.88-2.61 2.14-11.47-1.71-12.83-5.57-.58-1.64-3.48-3-6.44-3.02-6.19-.04-8.77-2.66-9.96-10.13zm12.13 6.52c1.73-.23 2.38-1.36 1.43-2.51-.94-1.15-3.13-1.9-4.86-1.67-1.73.23-2.38 1.36-1.44 2.51.95 1.15 3.13 1.9 4.87 1.67zm11.03 4.94c.57-1.65.69-3.42.28-3.93-.42-.5-1.7-.15-2.85.79-1.15.94-1.27 2.71-.28 3.93 1 1.22 2.28.86 2.85-.79zm119.95 125.39c-.96-3.06-2.44-5.83-3.29-6.17-.85-.33.26-2.08 2.48-3.9 4.84-3.96 6.66-2.36 5.29 4.65-.55 2.84.06 6.47 1.36 8.05 1.3 1.59 1.42 3.65.27 4.6-2.43 1.98-3.7.48-6.11-7.23zm-63-89.92c-1.17-9.81 15.81-6.55 19.2 3.68 1.05 3.19-.09 4.32-5.97 5.87-7.57 2.01-12.26-1.38-13.23-9.55z',
												fill: '#a73b22',
											}),
											Object(Ot.jsx)('path', {
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
			(bc.displayName = 'SausageIcon'), (bc.muiName = 'SvgIcon');
			var hc = bc,
				Oc = Object(oc.a)(function (e) {
					return Object(Ot.jsx)(
						cc.a,
						Object(m.a)(
							Object(m.a)({}, e),
							{},
							{
								children: Object(Ot.jsxs)('svg', {
									xmlns: 'http://www.w3.org/2000/svg',
									viewBox: '0 0 512.016 512.016',
									children: [
										Object(Ot.jsxs)('g', {
											fill: '#4caf50',
											children: [
												Object(Ot.jsx)('path', {
													d: 'M432 112.008c-6.464 0-12.576-3.968-14.976-10.368-3.136-8.288 1.056-17.504 9.344-20.608 40.512-15.2 54.368-53.888 54.496-54.272 2.944-8.352 12.192-12.768 20.384-9.856 8.352 2.912 12.736 12 9.888 20.352-.768 2.176-19.104 53.344-73.504 73.728a15.769 15.769 0 01-5.632 1.024z',
												}),
												Object(Ot.jsx)('path', {
													d: 'M496 176.008c-6.592 0-12.768-4.096-15.104-10.688-.416-1.12-14.88-39.456-54.528-54.336-8.288-3.104-12.48-12.32-9.344-20.608 3.104-8.288 12.384-12.448 20.608-9.344 54.4 20.416 72.704 71.552 73.504 73.728 2.88 8.352-1.536 17.44-9.888 20.352a15.736 15.736 0 01-5.248.896z',
												}),
											],
										}),
										Object(Ot.jsx)('path', {
											d: 'M336 134.376c-8.832 0-16 7.168-16 16v89.6c0 17.664-14.336 32-32 32h-16v-112c0-8.832-7.168-16-16-16s-16 7.168-16 16v112h-16c-17.632 0-32-14.336-32-32v-89.6c0-8.832-7.168-16-16-16s-16 7.168-16 16v89.6c0 35.296 28.704 64 64 64h16v176.032c0 8.832 7.168 16 16 16s16-7.168 16-16V303.976h16c35.296 0 64-28.704 64-64v-89.6c0-8.832-7.168-16-16-16z',
											fill: '#cfd8dc',
										}),
										Object(Ot.jsx)('path', {
											d: 'M368 16.008c-3.008 0-5.984.064-8.608.48L43.168 48.232v.16C18.56 50.856 0 71.336 0 96.008s18.56 45.152 43.168 47.616l315.872 31.872c2.72.448 5.792.512 8.96.512 44.128 0 80-35.904 80-80s-35.872-80-80-80z',
											fill: '#ff9800',
										}),
										Object(Ot.jsx)('g', {
											fill: '#ffd54f',
											children: Object(Ot.jsx)('path', {
												d: 'M122.048 78.856c1.952.8 3.968 1.152 5.952 1.152 6.336 0 12.352-3.808 14.848-10.048 4.192-10.496 7.36-21.536 9.888-32.736l-34.56 3.488c-1.664 5.792-2.816 11.808-5.024 17.344-3.296 8.192.704 17.504 8.896 20.8zM202.016 78.856c1.984.768 4 1.152 5.984 1.152 6.336 0 12.352-3.808 14.848-10.016 5.344-13.344 8.832-26.976 11.392-40.928l-33.088 3.296c-2.08 8.704-4.608 17.248-8 25.664-3.296 8.224.704 17.536 8.864 20.832zM298.912 22.568c-2.08 12-5.024 23.872-9.728 35.392-3.328 8.192.608 17.536 8.8 20.864 1.952.8 4 1.184 6.016 1.184 6.304 0 12.288-3.744 14.816-9.952 6.72-16.448 10.432-33.504 12.64-50.784l-32.544 3.296z',
											}),
										}),
									],
								}),
							},
						),
					);
				});
			(Oc.displayName = 'VegoIcon'), (Oc.muiName = 'SvgIcon');
			var mc,
				xc,
				gc,
				zc,
				vc,
				yc,
				Cc,
				Mc,
				_c,
				wc,
				kc,
				Pc,
				Tc,
				Sc,
				Ic,
				Ec,
				Rc,
				Ac,
				Lc,
				Dc,
				Uc = Oc,
				Nc = ht.a.div(
					mc ||
						(mc = Object(tt.a)([
							'\n  display: flex;\n  align-items: center;\n  width: 100%;\n  margin-bottom: 10px;\n',
						])),
				),
				Fc = ht.a.div(
					xc ||
						(xc = Object(tt.a)(['\n  flex-grow: 1;\n  svg {\n    padding-left: 5px;\n    padding-right: 5px;\n  }\n'])),
				),
				Gc = ht.a.div(gc || (gc = Object(tt.a)(['\n  color: ', ';\n  font-size: 12px;\n'])), Je.grey500),
				Wc = Object(ht.a)(rt.ListItem)(zc || (zc = Object(tt.a)(['\n  margin-bottom: 10px !important;\n']))),
				Bc = ht.a.div(vc || (vc = Object(tt.a)(['\n  color: ', ';\n  padding-top: 10px;\n'])), Je.grey500),
				Vc = ht.a.div(yc || (yc = Object(tt.a)(['\n  color: ', ';\n  padding-top: 10px;\n'])), Je.grey500),
				Hc = ht.a.div(Cc || (Cc = Object(tt.a)(['\n  color: ', ';\n  padding-top: 10px;\n'])), Je.grey500),
				qc = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.pollingPlace,
										t = ''.concat(e.name);
									return (
										null !== e.premises && (t = ''.concat(e.name, ', ').concat(e.premises)),
										Object(Ot.jsx)(jt.a, {
											children: Object(Ot.jsxs)(tc.Card, {
												children: [
													Object(Ot.jsx)(tc.CardHeader, { title: t, subtitle: e.address }),
													null !== e.stall &&
														Object(Ot.jsx)(tc.CardTitle, {
															title: e.stall.name,
															subtitle: e.stall.description,
															subtitleStyle: { whiteSpace: 'pre-wrap' },
														}),
													Object(Ot.jsxs)(tc.CardText, {
														children: [
															Object(Ot.jsx)(Nc, {
																children:
																	null !== e.stall &&
																	Object(Ot.jsxs)(Fc, {
																		children: [
																			e.stall.noms.bbq && Object(Ot.jsx)(hc, {}),
																			e.stall.noms.cake && Object(Ot.jsx)(ic, {}),
																			e.stall.noms.vego && Object(Ot.jsx)(Uc, {}),
																			e.stall.noms.nothing && Object(Ot.jsx)(fc, {}),
																			e.stall.noms.halal && Object(Ot.jsx)(dc, {}),
																			e.stall.noms.coffee && Object(Ot.jsx)(pc, {}),
																			e.stall.noms.bacon_and_eggs && Object(Ot.jsx)(ac, {}),
																		],
																	}),
															}),
															null !== e.stall &&
																'free_text' in e.stall.noms &&
																null !== e.stall.noms.free_text &&
																Object(Ot.jsxs)(Gc, { children: ['Also available: ', e.stall.noms.free_text] }),
															null !== e.stall &&
																e.stall.noms.run_out &&
																Object(Ot.jsx)(Wc, {
																	secondaryText:
																		"We've had reports that the stalls at this polling booth have run out of food.",
																	secondaryTextLines: 2,
																	leftAvatar: Object(Ot.jsx)(ec.a, {
																		icon: Object(Ot.jsx)(ft.AlertWarning, {}),
																		backgroundColor: Je.yellow600,
																	}),
																	disabled: !0,
																}),
															null !== e.stall &&
																'' !== e.stall.opening_hours &&
																Object(Ot.jsxs)(Vc, {
																	children: [
																		Object(Ot.jsx)(ft.DeviceAccessTime, {}),
																		' Stall Opening Hours: ',
																		e.stall.opening_hours,
																	],
																}),
															Object(Ot.jsxs)(Hc, {
																children: [Object(Ot.jsx)(ft.ActionAccessible, {}), ' Wheelchair Access: ', se(e)],
															}),
															e.divisions.length > 0 &&
																Object(Ot.jsxs)(Bc, { children: ['Division(s): ', e.divisions.join(', ')] }),
															null !== e.stall &&
																null !== e.stall.extra_info &&
																e.stall.extra_info.length > 0 &&
																Object(Ot.jsxs)(Bc, { children: ['Extra Info: ', e.stall.extra_info] }),
															e.booth_info.length > 0 &&
																Object(Ot.jsxs)(Bc, { children: ['Booth Info: ', e.booth_info] }),
														],
													}),
												],
											}),
										})
									);
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Jc = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.pollingPlace;
									return Object(Ot.jsx)(qc, { pollingPlace: e });
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Kc = Object(s.b)(
					function (e, t) {
						return {};
					},
					function (e) {
						return {};
					},
				)(Jc),
				Xc = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.pollingPlaces,
										n = e.onElectionChanged;
									return Object(Ot.jsxs)($e.Fragment, {
										children: [
											Object(Ot.jsx)(Xn, { onElectionChanged: n }),
											Object(Ot.jsx)('br', {}),
											t.length > 0 &&
												t.map(function (e) {
													return Object(Ot.jsx)(Kc, { pollingPlace: e }, e.id);
												}),
											0 === t.length &&
												Object(Ot.jsx)(Zn, {
													message: Object(Ot.jsxs)('div', {
														children: [
															"We haven't favourited any",
															Object(Ot.jsx)('br', {}),
															'polling places for this election yet.',
														],
													}),
													icon: Object(Ot.jsx)(ft.ActionCheckCircle, {}),
												}),
										],
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Yc = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return Object(Ge.a)(this, n), ((c = t.call(this, e)).state = { pollingPlaces: null }), c;
					}
					return (
						Object(We.a)(n, [
							{
								key: 'componentDidMount',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e() {
											var t, n, c;
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	(t = this.props),
																	(n = t.fetchPollingPlaces),
																	(c = t.election),
																	(e.t0 = this),
																	(e.next = 4),
																	n(c)
																);
															case 4:
																(e.t1 = e.sent), (e.t2 = { pollingPlaces: e.t1 }), e.t0.setState.call(e.t0, e.t2);
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
								key: 'UNSAFE_componentWillReceiveProps',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e(t) {
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																if (this.props.election.id === t.election.id) {
																	e.next = 8;
																	break;
																}
																return (e.t0 = this), (e.next = 5), t.fetchPollingPlaces(t.election);
															case 5:
																(e.t1 = e.sent), (e.t2 = { pollingPlaces: e.t1 }), e.t0.setState.call(e.t0, e.t2);
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
									return function (t) {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'render',
								value: function () {
									var e = this.props.onElectionChanged,
										t = this.state.pollingPlaces;
									return null === t ? null : Object(Ot.jsx)(Xc, { pollingPlaces: t, onElectionChanged: e });
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Qc = Object(s.b)(
					function (e, t) {
						return {
							election: e.elections.elections.find(function (e) {
								return e.id === parseInt(t.params.electionIdentifier, 10);
							}),
						};
					},
					function (e) {
						return {
							fetchPollingPlaces: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n) {
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(Z(n));
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
							onElectionChanged: function (e) {
								a.d.push('/election/'.concat(e, '/favourited_polling_places/'));
							},
						};
					},
				)(Yc),
				Zc = n(1958),
				$c = n(215),
				eo = n.n($c),
				to = n(1934),
				no = ht.a.span(Mc || (Mc = Object(tt.a)(['\n  color: purple;\n  font-weight: bold !important;\n']))),
				co = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Ot.jsx)(eo.a, Object(m.a)({}, this.props));
								},
							},
						]),
						n
					);
				})($e.Component),
				oo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.searchText,
										n = e.pollingPlaces,
										c = e.onPollingPlaceAutocompleteSelect,
										o = e.onChoosePollingPlace,
										s = n.map(function (e, n, c) {
											var o = to(oe(e), t, function (e, t) {
													return Object(Ot.jsx)(no, { children: e }, t);
												}),
												s = to(''.concat(e.address, ', ').concat(e.state), t, function (e, t) {
													return Object(Ot.jsx)(no, { children: e }, t);
												});
											return {
												text: ''.concat(e.name, ', ').concat(e.address),
												value: Object(Ot.jsx)(Vn.a, {
													children: Object(Ot.jsx)(rt.ListItem, { primaryText: o, secondaryText: s, disabled: !0 }),
													'data-foo': 1,
												}),
											};
										});
									return Object(Ot.jsx)(co, {
										floatingLabelText: 'Search for a polling place',
										autoComplete: 'off',
										dataSource: s,
										filter: eo.a.noFilter,
										maxSearchResults: 20,
										fullWidth: !0,
										menuProps: { maxHeight: 500 },
										onUpdateInput: c,
										onNewRequest: o,
										onClick: function (e) {
											e.target.setSelectionRange(0, e.target.value.length);
										},
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				so = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return (
							Object(Ge.a)(this, n),
							((c = t.call(this, e)).onFieldChangeDebounced = void 0),
							(c.state = { searchText: '', searchResults: [] }),
							(c.onFieldChangeDebounced = Object(Zc.a)(function (e) {
								this.setState(Object(m.a)(Object(m.a)({}, this.state), {}, { searchText: e }));
							}, 750)),
							c
						);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'componentDidUpdate',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e(t, n) {
											var c;
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																if (this.state.searchText === n.searchText) {
																	e.next = 5;
																	break;
																}
																return (
																	(e.next = 3),
																	this.props.onPollingPlaceSearch(this.props.election, this.state.searchText)
																);
															case 3:
																(c = e.sent),
																	this.setState(Object(m.a)(Object(m.a)({}, this.state), {}, { searchResults: c }));
															case 5:
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
								key: 'render',
								value: function () {
									var e = this,
										t = this.props.onPollingPlaceChosen;
									return Object(Ot.jsx)(oo, {
										searchText: this.state.searchText,
										pollingPlaces: this.state.searchResults,
										onPollingPlaceAutocompleteSelect: function (t, n, c) {
											'change' === c.source && t.length >= 3 && e.onFieldChangeDebounced(t);
										},
										onChoosePollingPlace: function (n, c) {
											c >= 0 && t(e.state.searchResults[c]);
										},
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				ao = Object(s.b)(
					function (e) {
						return {};
					},
					function (e) {
						return {
							onPollingPlaceSearch: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n, c) {
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														if (!(c.length > 0)) {
															t.next = 4;
															break;
														}
														return (t.next = 3), e(X(n, c));
													case 3:
														return t.abrupt('return', t.sent);
													case 4:
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
						};
					},
				)(so),
				lo = n(593),
				io = n.n(lo),
				ro = function (e, t) {
					for (
						var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null,
							c = t.split('.'),
							o = 0,
							s = c.length;
						o < s;
						o += 1
					) {
						if (null === e[c[o]]) return n;
						if (void 0 === e[c[o]]) return n;
						e = e[c[o]];
					}
					return e;
				},
				po = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Ot.jsx)(qt.a, Object(m.a)({ name: 'something', autoComplete: 'off' }, this.props));
								},
							},
						]),
						n
					);
				})($e.Component),
				jo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.hintText,
										n = e.name,
										c = Object(et.a)(e, ['hintText', 'name']);
									return Object(Ot.jsxs)('div', {
										children: [
											Object(Ot.jsx)(qt.a, Object(m.a)({ name: n }, c)),
											Object(Ot.jsx)('div', { style: { color: Je.grey500, fontSize: 12 }, children: t }),
										],
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				uo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Ot.jsx)(
										po,
										Object(m.a)({ component: Kt.Toggle, thumbStyle: { backgroundColor: Je.grey100 } }, this.props),
									);
								},
							},
						]),
						n
					);
				})($e.Component),
				fo = Object(ht.a)(tc.CardTitle)(_c || (_c = Object(tt.a)(['\n  padding-bottom: 0px !important;\n']))),
				bo = Object(ht.a)(tc.CardText)(wc || (wc = Object(tt.a)(['\n  padding-top: 0px !important;\n']))),
				ho = ht.a.button(kc || (kc = Object(tt.a)(['\n  display: none;\n']))),
				Oo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.stallWasEdited,
										n = e.pollingPlaceTypes,
										c = e.onSaveForm,
										o = e.onClickCopyLink,
										s = e.handleSubmit,
										a = e.onSubmit;
									return Object(Ot.jsxs)('form', {
										onSubmit: s(a),
										children: [
											!1 === t &&
												Object(Ot.jsx)(rt.ListItem, {
													leftAvatar: Object(Ot.jsx)(ec.a, {
														icon: Object(Ot.jsx)(ft.AvFiberNew, {}),
														backgroundColor: Je.blue500,
													}),
													primaryText: 'Stall information has been automatically populated',
													secondaryText:
														"This polling place had no reports yet, so just double check everything and hit 'Save' if it's all OK.",
													secondaryTextLines: 2,
													disabled: !0,
												}),
											!0 === t &&
												Object(Ot.jsx)(rt.ListItem, {
													leftAvatar: Object(Ot.jsx)(ec.a, {
														icon: Object(Ot.jsx)(ft.ActionChangeHistory, {}),
														backgroundColor: Je.blue500,
													}),
													primaryText: 'Stall edits have already been automatically applied',
													secondaryText: "So just double check everything and hit 'Save' if it's all OK.",
													secondaryTextLines: 2,
													disabled: !0,
													style: { backgroundColor: 'orange' },
												}),
											Object(Ot.jsxs)(tc.Card, {
												children: [
													Object(Ot.jsx)(fo, { title: 'Deliciousness' }),
													Object(Ot.jsxs)(bo, {
														children: [
															Object(Ot.jsxs)(rt.List, {
																children: [
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: 'Is there a sausage sizzle?',
																		leftIcon: Object(Ot.jsx)(hc, {}),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'bbq' }),
																	}),
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: 'Is there a cake stall?',
																		leftIcon: Object(Ot.jsx)(ic, {}),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'cake' }),
																	}),
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: 'Are there savoury vegetarian options?',
																		leftIcon: Object(Ot.jsx)(Uc, {}),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'vego' }),
																	}),
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: "Is there any food that's halal?",
																		leftIcon: Object(Ot.jsx)(dc, {}),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'halal' }),
																	}),
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: 'Do you have coffee?',
																		leftIcon: Object(Ot.jsx)(pc, {}),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'coffee' }),
																	}),
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: 'Are there bacon and eggs?',
																		leftIcon: Object(Ot.jsx)(ac, {}),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'bacon_and_eggs' }),
																	}),
																	Object(Ot.jsx)(at.a, {}),
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: 'Red. Cross. Of. Shame.',
																		leftIcon: Object(Ot.jsx)(fc, {}),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'nothing' }),
																	}),
																	Object(Ot.jsx)(rt.ListItem, {
																		primaryText: "They've run out of food!",
																		leftIcon: Object(Ot.jsx)(ft.ContentBlock, { color: Je.yellow700 }),
																		rightToggle: Object(Ot.jsx)(uo, { name: 'run_out' }),
																	}),
																],
															}),
															Object(Ot.jsx)(jo, {
																name: 'free_text',
																component: Kt.TextField,
																floatingLabelText: 'Anything else to add?',
																hintText: 'What other types of delicious are here?',
																fullWidth: !0,
															}),
														],
													}),
												],
											}),
											Object(Ot.jsxs)(tc.Card, {
												children: [
													Object(Ot.jsx)(fo, { title: 'Stall Information' }),
													Object(Ot.jsxs)(bo, {
														children: [
															Object(Ot.jsx)(jo, {
																name: 'name',
																component: Kt.TextField,
																floatingLabelText: 'Stall name',
																hintText: 'The name of the stall that is here',
																fullWidth: !0,
															}),
															Object(Ot.jsx)(jo, {
																name: 'description',
																component: Kt.TextField,
																multiLine: !0,
																floatingLabelText: 'Stall description',
																hintText: 'A brief description of the stall',
																fullWidth: !0,
															}),
															Object(Ot.jsx)(jo, {
																name: 'opening_hours',
																component: Kt.TextField,
																floatingLabelText: 'Opening hours',
																hintText: 'e.g. 8AM - 2PM',
																fullWidth: !0,
															}),
															Object(Ot.jsx)(jo, {
																name: 'website',
																component: Kt.TextField,
																floatingLabelText: 'Stall website',
																hintText: 'A link to the website of the people organising the stall',
																fullWidth: !0,
															}),
															Object(Ot.jsx)(jo, {
																name: 'extra_info',
																component: Kt.TextField,
																floatingLabelText: 'Extra info',
																hintText: 'Is there any other information to add?',
																fullWidth: !0,
															}),
														],
													}),
												],
											}),
											Object(Ot.jsxs)(tc.Card, {
												children: [
													Object(Ot.jsx)(fo, { title: 'Polling Place Information' }),
													Object(Ot.jsxs)(bo, {
														children: [
															Object(Ot.jsx)(po, {
																name: 'facility_type',
																component: Kt.SelectField,
																floatingLabelText: 'What type of polling place is this?',
																fullWidth: !0,
																children: n.map(function (e) {
																	return Object(Ot.jsx)(Vn.a, { value: e.name, primaryText: e.name }, e.name);
																}),
															}),
															Object(Ot.jsx)(jo, {
																name: 'source',
																component: Kt.TextField,
																floatingLabelText: 'Source of this report',
																hintText: 'What is the source? (e.g. Twitter, Facebook, School Newsletter)',
																fullWidth: !0,
															}),
														],
													}),
													Object(Ot.jsx)(rt.ListItem, {
														primaryText: 'Favourite this polling place',
														secondaryText:
															'This adds the polling place to the list of booths we can feature on social media.',
														secondaryTextLines: 2,
														leftCheckbox: Object(Ot.jsx)(qt.a, {
															name: 'favourited',
															component: Kt.Checkbox,
															checkedIcon: Object(Ot.jsx)(ft.ToggleStar, {}),
															uncheckedIcon: Object(Ot.jsx)(ft.ToggleStarBorder, {}),
														}),
													}),
													Object(Ot.jsxs)(tc.CardActions, {
														children: [
															Object(Ot.jsx)(wt.a, { label: 'Save', primary: !0, onClick: c }),
															Object(Ot.jsx)(it.a, {
																label: 'Copy Link',
																icon: Object(Ot.jsx)(ft.ContentContentCopy, {}),
																secondary: !0,
																onClick: o,
															}),
															Object(Ot.jsx)(ho, { type: 'submit' }),
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
				})($e.PureComponent),
				mo = Object(Jt.a)({ form: 'pollingPlace', enableReinitialize: !0, onChange: function (e, t, n) {} })(Oo),
				xo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						var e;
						Object(Ge.a)(this, n);
						for (var c = arguments.length, o = new Array(c), s = 0; s < c; s++) o[s] = arguments[s];
						return ((e = t.call.apply(t, [this].concat(o))).initialValues = void 0), e;
					}
					return (
						Object(We.a)(n, [
							{
								key: 'UNSAFE_componentWillMount',
								value: function () {
									this.initialValues = this.getInitialValues(this.props.pollingPlace, this.props.stall);
								},
							},
							{
								key: 'UNSAFE_componentWillReceiveProps',
								value: function (e) {
									(this.props.pollingPlace.id === e.pollingPlace.id && this.props.election.id === e.election.id) ||
										(this.initialValues = this.getInitialValues(e.pollingPlace, e.stall));
								},
							},
							{
								key: 'getInitialValues',
								value: function (e, t) {
									var n = Object(xn.a)(
										(function (e) {
											return Object(m.a)(
												Object(m.a)({}, ce(null !== e.stall ? e.stall.noms : null)),
												{},
												{
													name: ro(e, 'stall.name'),
													description: ro(e, 'stall.description'),
													opening_hours: ro(e, 'stall.opening_hours'),
													favourited: ro(e, 'stall.favourited', !1),
													website: ro(e, 'stall.website'),
													extra_info: ro(e, 'stall.extra_info'),
													source: ro(e, 'stall.source'),
													facility_type: ro(e, 'facility_type'),
												},
											);
										})(e),
									);
									return (
										void 0 !== t &&
											this.canStallPropsBeMerged() &&
											((n.bbq = t.noms.bbq),
											(n.cake = t.noms.cake),
											(n.coffee = t.noms.coffee),
											(n.halal = t.noms.halal),
											(n.vego = t.noms.vego),
											(n.bacon_and_eggs = t.noms.bacon_and_eggs),
											(n.free_text = t.noms.free_text),
											(n.name = t.name),
											(n.description = t.description),
											(n.opening_hours = t.opening_hours),
											(n.website = t.website),
											(n.source = 'Direct'),
											(n.extra_info = ''),
											(n.favourited = !1)),
										n
									);
								},
							},
							{
								key: 'canStallPropsBeMerged',
								value: function () {
									var e = this.props,
										t = e.pollingPlace,
										n = e.stall;
									return (
										void 0 !== n &&
										(!1 ===
											(function (e) {
												if (null === e.stall || null === e.stall.noms) return !1;
												for (var t = 0, n = Object.entries(e.stall.noms); t < n.length; t++) {
													var c = Object(B.a)(n[t], 2),
														o = c[0],
														s = c[1];
													if ('free_text' !== o) {
														if (!0 === s) return !0;
													} else if ('' !== s) return !0;
												}
												return !1;
											})(t) ||
											null !== n.diff)
									);
								},
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.stall,
										c = e.pollingPlace,
										o = e.onPollingPlaceEdited,
										s = e.isDirty,
										a = e.pollingPlaceTypes,
										l = e.onFormSubmit,
										i = e.onSaveForm,
										r = e.onClickCopyLink;
									return Object(Ot.jsx)(mo, {
										election: t,
										pollingPlace: c,
										initialValues: this.initialValues,
										isDirty: s,
										stallWasEdited: void 0 !== n ? null !== n.diff : void 0,
										pollingPlaceTypes: a,
										onSubmit: function (e, n, s) {
											l(e, t, c, o);
										},
										onSaveForm: function () {
											i(c, s);
										},
										onClickCopyLink: r,
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				go = Object(s.b)(
					function (e, t) {
						var n = e.polling_places;
						return { isDirty: Object(Vt.a)('pollingPlace')(e), pollingPlaceTypes: n.types };
					},
					function (e, t) {
						return {
							onFormSubmit: function (t, n, c, o) {
								return Object(h.a)(
									b.a.mark(function n() {
										var s;
										return b.a.wrap(function (n) {
											for (;;)
												switch ((n.prev = n.next)) {
													case 0:
														return (
															(s = {
																stall: {
																	noms: ce((a = t)),
																	name: a.name || '',
																	description: a.description || '',
																	opening_hours: a.opening_hours || '',
																	favourited: a.favourited,
																	website: a.website || '',
																	extra_info: a.extra_info || '',
																	source: a.source || '',
																},
																facility_type: a.facility_type,
															}),
															(n.next = 3),
															e($(0, c, s))
														);
													case 3:
														n.sent && o();
													case 5:
													case 'end':
														return n.stop();
												}
											var a;
										}, n);
									}),
								)();
							},
							onSaveForm: function (t, n) {
								e(Object(Ht.a)('pollingPlace'));
							},
							onClickCopyLink: function () {
								io()(ne(t.election, t.pollingPlace), { format: 'text/plain' }),
									e(P('Polling place link copied to clipboard.'));
							},
						};
					},
				)(xo),
				zo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props.pollingPlace,
										t = e.address === e.premises ? e.state : ''.concat(e.address, ', ').concat(e.state);
									return Object(Ot.jsx)(tc.Card, {
										children: Object(Ot.jsx)(tc.CardTitle, { title: oe(e), subtitle: t }),
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				vo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.pollingPlace;
									return Object(Ot.jsx)(zo, { election: t, pollingPlace: n });
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				yo = Object(s.b)(
					function (e, t) {
						return {};
					},
					function (e) {
						return {};
					},
				)(vo),
				Co = ht.a.div(
					Pc ||
						(Pc = Object(tt.a)([
							'\n  display: flex;\n  flex-direction: row;\n  align-items: left;\n  justify-content: left;\n  /* Or do it all in one line with flex flow */\n  flex-flow: row wrap;\n  /* tweak where items line up on the row valid values are: \n       flex-start, flex-end, space-between, space-around, stretch */\n  align-content: flex-end;\n  margin-bottom: 20px;\n',
						])),
				),
				Mo = ht.a.div(Tc || (Tc = Object(tt.a)(['\n  margin-right: 10px;\n']))),
				_o = ht.a.div(Sc || (Sc = Object(tt.a)(['\n  max-width: 500px;\n  width: 100%;\n']))),
				wo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.pollingPlace,
										c = e.stall,
										o = e.showAutoComplete,
										s = e.showElectionChooser,
										l = e.onPollingPlaceEdited,
										i = e.onElectionChanged;
									return Object(Ot.jsxs)('div', {
										children: [
											!0 === s &&
												Object(Ot.jsxs)(Co, {
													children: [
														Object(Ot.jsx)(Mo, { children: Object(Ot.jsx)(Xn, { onElectionChanged: i }) }),
														o &&
															Object(Ot.jsx)(_o, {
																children: Object(Ot.jsx)(
																	ao,
																	{
																		election: t,
																		onPollingPlaceChosen: function (e) {
																			a.d.push('/election/'.concat(t.id, '/polling_places/').concat(e.id, '/edit'));
																		},
																	},
																	t.id,
																),
															}),
													],
												}),
											!1 === s &&
												!0 === o &&
												Object(Ot.jsx)(
													ao,
													{
														election: t,
														onPollingPlaceChosen: function (e) {
															a.d.push('/election/'.concat(t.id, '/polling_places/').concat(e.id, '/edit'));
														},
													},
													t.id,
												),
											n && Object(Ot.jsx)(yo, { election: t, pollingPlace: n }),
											n && Object(Ot.jsx)(go, { election: t, stall: c, pollingPlace: n, onPollingPlaceEdited: l }),
										],
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				ko = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return Object(Ge.a)(this, n), ((c = t.call(this, e)).state = { pollingPlacesChecked: !1 }), c;
					}
					return (
						Object(We.a)(n, [
							{
								key: 'UNSAFE_componentWillMount',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e() {
											var t, n, c, o;
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																if (
																	((t = this.props),
																	(n = t.fetchRequiredState),
																	(c = t.election),
																	null === (o = t.pollingPlaceId))
																) {
																	e.next = 8;
																	break;
																}
																return (e.t0 = this), (e.next = 5), n(c, o);
															case 5:
																(e.t1 = e.sent),
																	(e.t2 = { pollingPlacesChecked: !0, pollingPlace: e.t1 }),
																	e.t0.setState.call(e.t0, e.t2);
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
								key: 'UNSAFE_componentWillReceiveProps',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e(t) {
											var n, c, o;
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																if (((n = t.fetchRequiredState), (c = t.election), null === (o = t.pollingPlaceId))) {
																	e.next = 10;
																	break;
																}
																return (e.t0 = this), (e.next = 5), n(c, o);
															case 5:
																(e.t1 = e.sent),
																	(e.t2 = { pollingPlacesChecked: !0, pollingPlace: e.t1 }),
																	e.t0.setState.call(e.t0, e.t2),
																	(e.next = 13);
																break;
															case 10:
																if (null !== o) {
																	e.next = 13;
																	break;
																}
																return (e.next = 13), this.setState({ pollingPlacesChecked: !0, pollingPlace: void 0 });
															case 13:
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
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.stall,
										c = e.showAutoComplete,
										o = e.showElectionChooser,
										s = e.onPollingPlaceEdited,
										a = e.onElectionChanged,
										l = null !== this.state && null !== this.state.pollingPlace ? this.state.pollingPlace : null;
									return this.state.pollingPlacesChecked && null === this.state.pollingPlace
										? Object(Ot.jsx)(rt.ListItem, {
												leftAvatar: Object(Ot.jsx)(ec.a, {
													icon: Object(Ot.jsx)(ft.CommunicationLocationOff, {}),
													backgroundColor: Je.blue500,
												}),
												primaryText: 'Notice',
												secondaryText: 'No polling place found',
												secondaryTextLines: 2,
												disabled: !0,
											})
										: Object(Ot.jsx)(wo, {
												election: t,
												pollingPlace: l,
												stall: n,
												showAutoComplete: c,
												showElectionChooser: o,
												onPollingPlaceEdited: s,
												onElectionChanged: a,
											});
								},
							},
						]),
						n
					);
				})($e.Component),
				Po = Object(s.b)(
					function (e) {
						return {};
					},
					function (e) {
						return {
							fetchRequiredState: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n, c) {
										var o;
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(Y(n, [c]));
													case 2:
														if (1 !== (o = t.sent).length) {
															t.next = 5;
															break;
														}
														return t.abrupt('return', o[0]);
													case 5:
														return t.abrupt('return', null);
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
							onElectionChanged: function (e) {
								a.d.push('/election/'.concat(e, '/polling_places/'));
							},
						};
					},
				)(ko),
				To = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.election,
										n = e.pollingPlaceId;
									return Object(Ot.jsx)(Po, {
										election: t,
										pollingPlaceId: n,
										showAutoComplete: !0,
										showElectionChooser: !0,
										onPollingPlaceEdited: function () {
											a.d.push('/election/'.concat(t.id, '/polling_places'));
										},
									});
								},
							},
						]),
						n
					);
				})($e.Component),
				So = Object(s.b)(
					function (e, t) {
						return {
							election: e.elections.elections.find(function (e) {
								return e.id === parseInt(t.params.electionIdentifier, 10);
							}),
							pollingPlaceId: t.params.pollingPlaceId || null,
						};
					},
					function (e) {
						return {};
					},
				)(To),
				Io = n(441),
				Eo = n.n(Io),
				Ro = n(216),
				Ao = n(594),
				Lo = ht.a.div(
					Ic ||
						(Ic = Object(tt.a)([
							'\n  width: 100%;\n  display: grid;\n  grid-gap: 2%;\n  grid-template-columns: repeat(1, 100%);\n',
						])),
				),
				Do = ht.a.div(
					Ec ||
						(Ec = Object(tt.a)([
							'\n  width: 100%;\n  display: grid;\n  grid-gap: 1%;\n  grid-template-columns: 25% 60% 15%;\n  border-bottom: 1px solid ',
							';\n',
						])),
					Je.blueGrey50,
				),
				Uo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									return Object(Ot.jsx)(a.a, Object(m.a)({ to: 'something' }, this.props));
								},
							},
						]),
						n
					);
				})($e.Component),
				No = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return (
							Object(Ge.a)(this, n),
							((c = t.call(this, e)).onChangeType = void 0),
							(c.onChangeType = function (t, n, c) {
								e.onChangeType(c, t);
							}),
							c
						);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this,
										t = this.props,
										n = t.pollingPlaces,
										c = t.pollingPlaceTypes,
										o = t.onElectionChanged,
										s = { radio: { display: 'inline-block', width: '33%' } };
									return 0 === n.length
										? Object(Ot.jsx)(Zn, {
												message: Object(Ot.jsxs)('div', {
													children: ['Good work, all of the polling', Object(Ot.jsx)('br', {}), ' places have types!'],
												}),
												icon: Object(Ot.jsx)(ft.ActionCheckCircle, {}),
											})
										: Object(Ot.jsxs)(Lo, {
												children: [
													Object(Ot.jsx)(Xn, { onElectionChanged: o }),
													Object(Ot.jsx)('br', {}),
													Object(Ot.jsx)(Ao.a, {
														width: '100%',
														height: 900,
														itemCount: n.length,
														itemSize: 122.25,
														renderItem: function (t) {
															var o = t.index,
																a = t.style;
															return Object(Ot.jsx)(
																'div',
																{
																	style: a,
																	children: Object(Ot.jsxs)(Do, {
																		children: [
																			Object(Ot.jsxs)('div', {
																				children: [
																					Object(Ot.jsx)('h3', { children: n[o].name }),
																					Object(Ot.jsx)('h4', { children: n[o].premises }),
																				],
																			}),
																			Object(Ot.jsx)('div', {
																				children: Object(Ot.jsx)(Ro.RadioButtonGroup, {
																					name: 'pollingPlaceTypes-'.concat(n[o].id),
																					onChange: e.onChangeType.bind(e, n[o]),
																					children: c.map(function (e) {
																						return Object(Ot.jsx)(
																							Ro.RadioButton,
																							{ value: e.name, label: e.name, style: s.radio },
																							e.name,
																						);
																					}),
																				}),
																			}),
																			Object(Ot.jsx)('div', {
																				children: Object(Ot.jsx)(wt.a, {
																					label: 'Google It',
																					primary: !0,
																					icon: Object(Ot.jsx)(ft.ActionOpenInNew, {}),
																					containerElement: Object(Ot.jsx)(Uo, {
																						to: 'https://www.google.com.au/search?q='.concat(n[o].premises),
																						target: '_blank',
																					}),
																				}),
																			}),
																		],
																	}),
																},
																o,
															);
														},
													}),
												],
											});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Fo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n(e) {
						var c;
						return Object(Ge.a)(this, n), ((c = t.call(this, e)).state = { pollingPlaces: null }), c;
					}
					return (
						Object(We.a)(n, [
							{
								key: 'componentDidMount',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e() {
											var t, n, c;
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	(t = this.props),
																	(n = t.fetchPollingPlaces),
																	(c = t.election),
																	(e.t0 = this),
																	(e.next = 4),
																	n(c)
																);
															case 4:
																(e.t1 = e.sent), (e.t2 = { pollingPlaces: e.t1 }), e.t0.setState.call(e.t0, e.t2);
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
								key: 'UNSAFE_componentWillReceiveProps',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e(t) {
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																if (this.props.election.id === t.election.id) {
																	e.next = 8;
																	break;
																}
																return (e.t0 = this), (e.next = 5), t.fetchPollingPlaces(t.election);
															case 5:
																(e.t1 = e.sent), (e.t2 = { pollingPlaces: e.t1 }), e.t0.setState.call(e.t0, e.t2);
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
									return function (t) {
										return e.apply(this, arguments);
									};
								})(),
							},
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.pollingPlaceTypes,
										n = e.election,
										c = e.updatePollingPlaceType,
										o = e.onElectionChanged,
										s = this.state.pollingPlaces;
									return !1 === n.polling_places_loaded
										? Object(Ot.jsx)(Zn, {
												message: Object(Ot.jsxs)('div', {
													children: [
														"We don't have any polling",
														Object(Ot.jsx)('br', {}),
														'places for this election yet :(',
													],
												}),
												icon: Object(Ot.jsx)(Eo.a, {}),
											})
										: null === s
											? null
											: Object(Ot.jsx)(No, {
													pollingPlaces: s,
													pollingPlaceTypes: t,
													onChangeType: function (e, t) {
														c(n, t, e);
													},
													onElectionChanged: o,
												});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Go = Object(s.b)(
					function (e, t) {
						var n = e.elections,
							c = e.polling_places;
						return {
							election: n.elections.find(function (e) {
								return e.id === parseInt(t.params.electionIdentifier, 10);
							}),
							pollingPlaceTypes: c.types,
						};
					},
					function (e) {
						return {
							fetchPollingPlaces: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n) {
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														if (!0 !== n.polling_places_loaded) {
															t.next = 4;
															break;
														}
														return (t.next = 3), e(Q(n));
													case 3:
														return t.abrupt('return', t.sent);
													case 4:
														return t.abrupt('return', null);
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
							updatePollingPlaceType: function (t, n, c) {
								e($(0, n, { facility_type: c }));
							},
							onElectionChanged: function (e) {
								a.d.push('/election/'.concat(e, '/polling_place_types/'));
							},
						};
					},
				)(Fo),
				Wo = n(1953),
				Bo = n(54),
				Vo = n(601),
				Ho = n(1956),
				qo = Object(ht.a)(rt.ListItem)(
					Rc ||
						(Rc = Object(tt.a)([
							'\n  & div:last-child {\n    height: auto !important;\n    white-space: normal !important;\n    -webkit-line-clamp: unset !important;\n    line-clamp: unset !important;\n    overflow: auto !important;\n  }\n',
						])),
				),
				Jo = ht.a.div(Ac || (Ac = Object(tt.a)(['\n  color: ', ';\n  font-size: 12px;\n'])), Je.grey500),
				Ko = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e,
										t,
										n,
										c,
										o,
										s,
										a,
										l,
										i,
										r,
										p,
										j,
										d,
										u = this.props,
										f = u.stall,
										b = u.cardActions,
										h = (function (e) {
											return null === e.current_stall
												? null
												: Object(Vo.a)(
														Object(Ho.a)(e, ['name', 'description', 'opening_hours', 'website', 'noms']),
														Object(Ho.a)(e.current_stall, ['name', 'description', 'opening_hours', 'website', 'noms']),
													);
										})(f),
										O = null !== h ? Object.keys(h) : [],
										m = function (e) {
											return O.includes(e) ? { backgroundColor: Je.lightGreen100 } : void 0;
										},
										x = function (e) {
											return O.includes(e) ? { backgroundColor: Je.blue100 } : void 0;
										};
									return Object(Ot.jsxs)(tc.Card, {
										children: [
											Object(Ot.jsx)(tc.CardHeader, {
												title: f.name,
												subtitle: f.description,
												avatar: Object(Ot.jsx)(Xt.a, { icon: Object(Ot.jsx)(ft.ActionHome, {}) }),
											}),
											Object(Ot.jsxs)(tc.CardText, {
												style: { paddingTop: 0, paddingBottom: 0 },
												children: [
													Object(Ot.jsxs)(rt.List, {
														style: { paddingTop: 0, paddingBottom: 0 },
														children: [
															Object(Ot.jsx)(rt.ListItem, {
																primaryText: 'Polling Place',
																secondaryText: Oe(f),
																leftIcon: Object(Ot.jsx)(ft.MapsPlace, {}),
																disabled: !0,
															}),
															Object(Ot.jsx)(rt.ListItem, {
																primaryText: 'Address',
																secondaryText: me(f),
																leftIcon: Object(Ot.jsx)(ft.MapsPlace, {}),
																disabled: !0,
															}),
															Object(Ot.jsx)(qo, {
																primaryText: 'Name',
																secondaryText: f.name,
																leftIcon: Object(Ot.jsx)(ft.ActionLabel, {}),
																disabled: !0,
																style: m('name'),
															}),
															O.includes('name') &&
																Object(Ot.jsx)(qo, {
																	primaryText: 'Name (was previously)',
																	secondaryText: null === (e = f.current_stall) || void 0 === e ? void 0 : e.name,
																	leftIcon: Object(Ot.jsx)(ft.ActionLabel, {}),
																	disabled: !0,
																	style: x('name'),
																}),
															Object(Ot.jsx)(qo, {
																primaryText: 'Description',
																secondaryText: f.description,
																secondaryTextLines: 2,
																leftIcon: Object(Ot.jsx)(ft.ActionDescription, {}),
																disabled: !0,
																style: m('description'),
															}),
															O.includes('description') &&
																Object(Ot.jsx)(qo, {
																	primaryText: 'Description (was previously)',
																	secondaryText:
																		null === (t = f.current_stall) || void 0 === t ? void 0 : t.description,
																	secondaryTextLines: 2,
																	leftIcon: Object(Ot.jsx)(ft.ActionDescription, {}),
																	disabled: !0,
																	style: x('description'),
																}),
															Object(Ot.jsx)(rt.ListItem, {
																primaryText: 'Opening hours',
																secondaryText: f.opening_hours,
																leftIcon: Object(Ot.jsx)(ft.DeviceAccessTime, {}),
																disabled: !0,
																style: m('opening_hours'),
															}),
															O.includes('opening_hours') &&
																Object(Ot.jsx)(rt.ListItem, {
																	primaryText: 'Opening hours (was previously)',
																	secondaryText:
																		null === (n = f.current_stall) || void 0 === n ? void 0 : n.opening_hours,
																	leftIcon: Object(Ot.jsx)(ft.DeviceAccessTime, {}),
																	disabled: !0,
																	style: x('opening_hours'),
																}),
															Object(Ot.jsx)(rt.ListItem, {
																primaryText: 'Website',
																secondaryText: f.website,
																leftIcon: Object(Ot.jsx)(ft.AvWeb, {}),
																disabled: !0,
																style: m('website'),
															}),
															O.includes('website') &&
																Object(Ot.jsx)(rt.ListItem, {
																	primaryText: 'Website (was previously)',
																	secondaryText: null === (c = f.current_stall) || void 0 === c ? void 0 : c.website,
																	leftIcon: Object(Ot.jsx)(ft.AvWeb, {}),
																	disabled: !0,
																	style: x('website'),
																}),
															Object(Ot.jsx)(rt.ListItem, {
																primaryText: 'Email',
																secondaryText: f.email,
																leftIcon: Object(Ot.jsx)(ft.CommunicationEmail, {}),
																disabled: !0,
																style: m('email'),
															}),
															Object(Ot.jsxs)(rt.ListItem, {
																leftIcon: Object(Ot.jsx)(ft.MapsLocalDining, {}),
																disabled: !0,
																style: m('noms'),
																children: [
																	Object(Ot.jsx)('div', { children: 'Deliciousness' }),
																	f.noms.bbq &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Sausage Sizzle',
																			touch: !0,
																			children: Object(Ot.jsx)(hc, {}),
																		}),
																	f.noms.cake &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Cake Stall',
																			touch: !0,
																			children: Object(Ot.jsx)(ic, {}),
																		}),
																	f.noms.vego &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Savoury Vegetarian Options',
																			touch: !0,
																			children: Object(Ot.jsx)(Uc, {}),
																		}),
																	f.noms.halal &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Halal Options',
																			touch: !0,
																			children: Object(Ot.jsx)(dc, {}),
																		}),
																	f.noms.coffee &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Coffee',
																			touch: !0,
																			children: Object(Ot.jsx)(pc, {}),
																		}),
																	f.noms.bacon_and_eggs &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Bacon and Eggs',
																			touch: !0,
																			children: Object(Ot.jsx)(ac, {}),
																		}),
																	'free_text' in f.noms &&
																		Object(Ot.jsxs)(Jo, { children: ['Also has: ', f.noms.free_text] }),
																],
															}),
														],
													}),
													Object(Ot.jsx)(rt.List, {
														children:
															O.includes('noms') &&
															Object(Ot.jsxs)(rt.ListItem, {
																leftIcon: Object(Ot.jsx)(ft.MapsLocalDining, {}),
																disabled: !0,
																style: x('noms'),
																children: [
																	Object(Ot.jsx)('div', { children: 'Deliciousness (was previously)' }),
																	(null === (o = f.current_stall) || void 0 === o ? void 0 : o.noms.bbq) &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Sausage Sizzle',
																			touch: !0,
																			children: Object(Ot.jsx)(hc, {}),
																		}),
																	(null === (s = f.current_stall) || void 0 === s ? void 0 : s.noms.cake) &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Cake Stall',
																			touch: !0,
																			children: Object(Ot.jsx)(ic, {}),
																		}),
																	(null === (a = f.current_stall) || void 0 === a ? void 0 : a.noms.vego) &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Savoury Vegetarian Options',
																			touch: !0,
																			children: Object(Ot.jsx)(Uc, {}),
																		}),
																	(null === (l = f.current_stall) || void 0 === l ? void 0 : l.noms.halal) &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Halal Options',
																			touch: !0,
																			children: Object(Ot.jsx)(dc, {}),
																		}),
																	(null === (i = f.current_stall) || void 0 === i ? void 0 : i.noms.coffee) &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Coffee',
																			touch: !0,
																			children: Object(Ot.jsx)(pc, {}),
																		}),
																	(null === (r = f.current_stall) || void 0 === r ? void 0 : r.noms.bacon_and_eggs) &&
																		Object(Ot.jsx)(Rn.a, {
																			tooltip: 'Bacon and Eggs',
																			touch: !0,
																			children: Object(Ot.jsx)(ac, {}),
																		}),
																	void 0 !== (null === (p = f.current_stall) || void 0 === p ? void 0 : p.noms) &&
																		'free_text' in (null === (j = f.current_stall) || void 0 === j ? void 0 : j.noms) &&
																		Object(Ot.jsxs)(Jo, {
																			children: [
																				'Also has: ',
																				null === (d = f.current_stall) || void 0 === d ? void 0 : d.noms.free_text,
																			],
																		}),
																],
															}),
													}),
												],
											}),
											b,
										],
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Xo = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.stall,
										n = e.cardActions;
									return Object(Ot.jsx)(Ko, { stall: t, cardActions: n });
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				Yo = Object(s.b)(
					function (e, t) {
						return {};
					},
					function (e) {
						return {};
					},
				)(Xo),
				Qo = ht.a.div(
					Lc ||
						(Lc = Object(tt.a)([
							'\n  display: -ms-flex;\n  display: -webkit-flex;\n  display: flex;\n  flex-direction: row;\n  align-items: left;\n  justify-content: left;\n  /* Or do it all in one line with flex flow */\n  flex-flow: row wrap;\n  /* tweak where items line up on the row valid values are: \n       flex-start, flex-end, space-between, space-around, stretch */\n  align-content: flex-end;\n',
						])),
				),
				Zo = ht.a.div(Dc || (Dc = Object(tt.a)(['\n  width: 40%;\n  min-width: 340px;\n  padding: 10px;\n']))),
				$o = function (e) {
					if (void 0 === e.diff || null === e.diff) return e;
					var t = Object(xn.a)(e);
					return (
						e.diff.forEach(function (e) {
							if (Object(Wo.a)(e.old) && Object(Wo.a)(e.new)) t[e.field] = e.new;
							else {
								if (Object(Bo.a)(e.old) && Object(Bo.a)(e.new))
									throw Error('Handling arrays in merging stall diffs is not implemented');
								t[e.field] = e.new;
							}
						}),
						t
					);
				},
				es = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.stall,
										n = e.election,
										c = e.onPollingPlaceEdited,
										o = e.onApproveUnofficialStall,
										s = e.onDeclineUnofficialStall;
									return Object(Ot.jsxs)(Qo, {
										children: [
											Object(Ot.jsxs)(Zo, {
												children: [
													null !== t.diff &&
														Object(Ot.jsx)(rt.ListItem, {
															primaryText: 'This stall has been edited since it was first approved',
															secondaryText: 'Changes are highlighted below',
															leftIcon: Object(Ot.jsx)(ft.AlertWarning, { color: Je.orange300 }),
															style: { marginBottom: 10 },
														}),
													Object(Ot.jsx)(Yo, {
														stall: t,
														cardActions: Object(Ot.jsxs)(tc.CardActions, {
															children: [
																null === t.polling_place &&
																	Object(Ot.jsx)(it.a, { label: 'Approve', primary: !0, onClick: o }),
																Object(Ot.jsx)(it.a, { label: 'Decline', primary: !0, onClick: s }),
															],
														}),
													}),
													Object(Ot.jsx)(rt.ListItem, { primaryText: n.name }),
													!1 === n.polling_places_loaded &&
														null === t.polling_place &&
														Object(Ot.jsx)(rt.ListItem, {
															leftAvatar: Object(Ot.jsx)(ec.a, {
																icon: Object(Ot.jsx)(ft.AlertWarning, {}),
																backgroundColor: Je.blue500,
															}),
															primaryText: 'Notice',
															secondaryText:
																"We don't have official polling places for this election yet. Approving will add it to the map as a temporary polling place.",
															secondaryTextLines: 2,
															disabled: !0,
														}),
												],
											}),
											Object(Ot.jsx)(Zo, {
												children: Object(Ot.jsx)(Po, {
													election: n,
													pollingPlaceId: null !== t.polling_place ? t.polling_place.id : null,
													stall: $o(t),
													showAutoComplete: !1,
													showElectionChooser: !1,
													onPollingPlaceEdited: c,
												}),
											}),
										],
									});
								},
							},
						]),
						n
					);
				})($e.PureComponent),
				ts = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.stall,
										n = e.election,
										c = e.onPollingPlaceEdited,
										o = e.onApproveUnofficialStall,
										s = e.onDeclineUnofficialStall;
									return null === t || null === n
										? null
										: Object(Ot.jsx)(es, {
												election: n,
												stall: t,
												onPollingPlaceEdited: function () {
													c(t.id);
												},
												onApproveUnofficialStall: function () {
													o(t.id);
												},
												onDeclineUnofficialStall: function () {
													s(t.id);
												},
											});
								},
							},
						]),
						n
					);
				})($e.Component),
				ns = Object(s.b)(
					function (e, t) {
						var n = e.stalls,
							c = e.elections,
							o = n.pending.find(function (e) {
								return e.id === parseInt(t.params.stallId, 10);
							}),
							s =
								void 0 !== o
									? c.elections.find(function (e) {
											return e.id === o.election_id;
										})
									: null;
						return { stall: o, election: s };
					},
					function (e) {
						return {
							onPollingPlaceEdited: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n) {
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(fe(n));
													case 2:
														t.sent && a.d.push('/stalls');
													case 4:
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
							onApproveUnofficialStall: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n) {
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(be(n));
													case 2:
														t.sent && a.d.push('/stalls');
													case 4:
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
							onDeclineUnofficialStall: (function () {
								var t = Object(h.a)(
									b.a.mark(function t(n) {
										return b.a.wrap(function (t) {
											for (;;)
												switch ((t.prev = t.next)) {
													case 0:
														return (t.next = 2), e(he(n));
													case 2:
														t.sent && a.d.push('/stalls');
													case 4:
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
				)(ts),
				cs = n(1959),
				os = n(269),
				ss = n.n(os),
				as = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.stalls,
										n = e.elections,
										c = Object(cs.a)(t, 'election_id');
									return Object(Ot.jsx)(rt.List, {
										children: Object.keys(c).map(function (e) {
											var t = n.find(function (t) {
												return t.id === parseInt(e, 10);
											});
											return Object(Ot.jsxs)(
												'div',
												{
													children: [
														Object(Ot.jsx)(ss.a, { children: t.name }, e),
														c[e].map(function (e) {
															return Object(Ot.jsx)(
																rt.ListItem,
																{
																	primaryText: e.name,
																	secondaryText: Oe(e),
																	leftIcon:
																		null !== e.diff
																			? Object(Ot.jsx)(ft.ActionChangeHistory, {})
																			: Object(Ot.jsx)(ft.AvFiberNew, {}),
																	containerElement: Object(Ot.jsx)(a.a, { to: '/stalls/'.concat(e.id, '/') }),
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
				})($e.PureComponent),
				ls = (function (e) {
					Object(Be.a)(n, e);
					var t = Object(Ve.a)(n);
					function n() {
						return Object(Ge.a)(this, n), t.apply(this, arguments);
					}
					return (
						Object(We.a)(n, [
							{
								key: 'render',
								value: function () {
									var e = this.props,
										t = e.stalls,
										n = e.elections;
									return Object(Ot.jsx)(as, { stalls: t, elections: n });
								},
							},
						]),
						n
					);
				})($e.Component),
				is = Object(s.b)(
					function (e) {
						var t = e.elections;
						return { stalls: e.stalls.pending, elections: t.elections };
					},
					function (e) {
						return {};
					},
				)(ls),
				rs = function (e) {
					return Object(Ot.jsxs)(a.b, {
						path: '/',
						component: Bt,
						children: [
							Object(Ot.jsx)(a.b, { path: '/elections', components: { content: Wn } }),
							Object(Ot.jsx)(a.b, { path: '/election/new', components: { content: mn } }),
							Object(Ot.jsx)(a.b, {
								path: '/election/:electionIdentifier/load_polling_places',
								components: { content: In },
							}),
							Object(Ot.jsx)(a.b, { path: '/election/:electionIdentifier', components: { content: vn } }),
							Object(Ot.jsx)(a.b, {
								path: '/election/:electionIdentifier/polling_places(/:pollingPlaceId)(/edit)',
								components: { content: So },
							}),
							Object(Ot.jsx)(a.b, {
								path: '/election/:electionIdentifier/favourited_polling_places',
								components: { content: Qc },
							}),
							Object(Ot.jsx)(a.b, {
								path: '/election/:electionIdentifier/polling_place_types',
								components: { content: Go },
							}),
							Object(Ot.jsx)(a.b, { path: '/stalls', components: { content: is } }),
							Object(Ot.jsx)(a.b, { path: '/stalls(/:stallId)', components: { content: ns } }),
						],
					});
				},
				ps = n(287),
				js = n(595),
				ds = (function () {
					function e() {
						Object(Ge.a)(this, e),
							(this.baseURL = void 0),
							(this.baseURL = 'https://admin.staging.democracysausage.org/api');
					}
					return (
						Object(We.a)(e, [
							{
								key: 'handleResponse',
								value: function (e, t, n) {
									var c = this;
									return 404 === t.status
										? { response: t, undefined: void 0 }
										: t.status >= 401
											? t
													.json()
													.then(function (o) {
														return c.handleError(o, e, n), { response: t, json: o };
													})
													.catch(function (e) {
														return { response: t, json: null };
													})
											: t.json().then(function (e) {
													return (
														400 === t.status &&
															n(P("Sorry about this, but there's been an error handling your request.")),
														{ response: t, json: e }
													);
												});
								},
							},
							{
								key: 'handleError',
								value: function (e, t, n) {
									!0 === Se() ? console.error(e) : (Ne.b(''.concat(e, ' For ').concat(t)), Ne.b(e), c.b());
								},
							},
							{
								key: 'get',
								value: (function () {
									var e = Object(h.a)(
										b.a.mark(function e(t, n) {
											var c,
												o,
												s,
												a = this,
												l = arguments;
											return b.a.wrap(
												function (e) {
													for (;;)
														switch ((e.prev = e.next)) {
															case 0:
																return (
																	(c = l.length > 2 && void 0 !== l[2] ? l[2] : {}),
																	(o = l.length > 3 && void 0 !== l[3] ? l[3] : {}),
																	n(Pe()),
																	Object.keys(c).length > 0 && (t += '?'.concat(js.stringify(c))),
																	(e.next = 6),
																	fetch(this.baseURL + t, Object(m.a)(Object(m.a)({}, { credentials: 'include' }), o))
																		.then(function (e) {
																			return n(Te()), a.handleResponse(t, e, n);
																		})
																		.catch(function (e) {
																			return a.handleError(e, t, n);
																		})
																);
															case 6:
																if (void 0 === (s = e.sent)) {
																	e.next = 9;
																	break;
																}
																return e.abrupt('return', s);
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
										c = arguments.length > 2 ? arguments[2] : void 0;
									return (
										c(Pe()),
										fetch(this.baseURL + e, {
											method: 'POST',
											mode: 'cors',
											credentials: 'include',
											headers: { 'Content-Type': 'application/json', 'X-CSRFToken': ps.get('csrftoken') },
											body: JSON.stringify(n),
										})
											.then(function (n) {
												return c(Te()), t.handleResponse(e, n, c);
											})
											.catch(function (n) {
												return t.handleError(n, e, c);
											})
									);
								},
							},
							{
								key: 'put',
								value: function (e, t) {
									var n = this,
										c = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
										o = arguments.length > 3 ? arguments[3] : void 0;
									return (
										o(Pe()),
										fetch(this.baseURL + e, {
											method: 'PUT',
											mode: 'cors',
											credentials: 'include',
											headers: Object(m.a)({ 'X-CSRFToken': ps.get('csrftoken') }, c),
											body: t,
										})
											.then(function (t) {
												return o(Te()), n.handleResponse(e, t, o);
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
										c = arguments.length > 2 ? arguments[2] : void 0;
									return (
										c(Pe()),
										fetch(this.baseURL + e, {
											method: 'PATCH',
											mode: 'cors',
											credentials: 'include',
											headers: { 'Content-Type': 'application/json', 'X-CSRFToken': ps.get('csrftoken') },
											body: JSON.stringify(n),
										})
											.then(function (n) {
												return c(Te()), t.handleResponse(e, n, c);
											})
											.catch(function (n) {
												return t.handleError(n, e, c);
											})
									);
								},
							},
							{
								key: 'delete',
								value: function (e, t, n) {
									var c = this;
									return (
										n(Pe()),
										fetch(this.baseURL + e, {
											method: 'DELETE',
											mode: 'cors',
											credentials: 'include',
											headers: { 'Content-Type': 'application/json', 'X-CSRFToken': ps.get('csrftoken') },
											body: JSON.stringify(t),
										})
											.then(function (e) {
												return n(Te()), e;
											})
											.catch(function (t) {
												return c.handleError(t, e, n);
											})
									);
								},
							},
						]),
						e
					);
				})(),
				us = [];
			'REACT_APP_RAVEN_URL' in
				Object({
					NODE_ENV: 'production',
					PUBLIC_URL: '',
					WDS_SOCKET_HOST: void 0,
					WDS_SOCKET_PATH: void 0,
					WDS_SOCKET_PORT: void 0,
					FAST_REFRESH: !0,
					REACT_APP_RAVEN_URL: 'https://8d31580cc3314ca0812ff9d72c4d996f@sentry.io/291819',
					REACT_APP_GOOGLE_ANALYTICS_UA: 'UA-48888573-1',
					REACT_APP_ENVIRONMENT: 'PRODUCTION',
					REACT_APP_RAVEN_SITE_NAME: 'DemSausage Admin',
					REACT_APP_API_BASE_URL: 'https://admin.staging.democracysausage.org/api',
					REACT_APP_GOOGLE_MAPS_API_KEY: 'AIzaSyBuOuavKmg0pKmdGEPdugThfnKQ7v1sSH0',
					REACT_APP_PUBLIC_SITE_BASE_URL: 'https://democracysausage.org',
					REACT_APP_SITE_BASE_URL: 'https://admin.staging.democracysausage.org',
				}) &&
				(c.a({
					dsn: 'https://8d31580cc3314ca0812ff9d72c4d996f@sentry.io/291819',
					environment: ''.concat('PRODUCTION', '-ADMIN').toUpperCase(),
					site: 'DemSausage Admin',
					attachStacktrace: !0,
				}),
				us.push(Fe));
			var fs = Object(r.composeWithDevTools)({}),
				bs = Object(i.createStore)(
					De,
					fs(p.b, i.applyMiddleware.apply(void 0, [j.a.withExtraArgument(new ds())].concat(us))),
				),
				hs = Object(l.syncHistoryWithStore)(a.d, bs);
			o.render(
				Object(Ot.jsx)(s.a, { store: bs, children: Object(Ot.jsx)(a.c, { history: hs, children: rs(bs) }) }),
				document.getElementById('root'),
			);
		},
		660: function (e, t, n) {},
	},
	[[1949, 1, 2]],
]);
//# sourceMappingURL=main.1adc8f70.chunk.js.map
