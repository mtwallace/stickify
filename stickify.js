(function ( $ ) {
	$.fn.stickify = function (options) {
		$settings = $.extend( {}, $.fn.stickify.defaults, options );
		$staticStyles = {
			position: 'static',
			top: 'auto',
			left: 'auto',
			bottom: 'auto',
			width: '100%'
		}

		$(window).load(function() {
			getScreenSize();

			if ($screenWidth >= $settings.minScreenSize) {
				defineGlobals();
				prepAds();
				adPositioner();
				if ($settings.heightAnimations) fixForAnimations();
			}

			$(window).on('scroll', function() {
				var header = $($settings.stickyHeader),
					headerHeight = header.height();

				if ($screenWidth >= $settings.minScreenSize) {
					adPositioner();
				
					if ($settings.animatedHeader && headerHeight !== $headerHeight) {
						var interval1 = setInterval(update, 100);

						function update() {
							headerHeight = header.height();

							if (headerHeight == $headerHeight) {
								resizingHeader(false);
								clearInterval(interval1);
							} else {
								setOffset();
								setHeaderHeight();
								setFixTopPx();
								adPositioner();
								resizingHeader(true);
							}
						}
					}
				}
			});
		});

		$(window).on('resize', function() {
			getScreenSize();
			getAdItems();

			$items.each(function() {
				var el = $(this);
				el.css('height', 'auto');
				el.find("." + $settings.stickyInternalClass).removeClass('absolute').removeClass('fixed').addClass('static').css($staticStyles);
			});

			if ($screenWidth >= $settings.minScreenSize) {
				defineGlobals();
				prepAds();
				adPositioner();
			}
		});

		$('body').click(function() {
			if ($screenWidth >= $settings.minScreenSize && $settings.heightAnimations && !$dontStick) {
				var interval1 = setInterval(update, 100);

				function update() {
					var offset = $($settings.stickyContainer).offset().top,
						adInfo = $adInfo;

					if (offset == $offset && adInfo[$adIndex].topStickPoint == $adInfo[$adIndex].topStickPoint) clearInterval(interval1);
					else {
						setOffset();
						setFixTopPx();
						prepAds();
						adPositioner();
					}
				}
			}
		});

		function adPositioner() {
			if (!$dontStick) {
				setScrollPosition();
				setAdIndex();

				if ($adIndex > 0) {
					for (i = $adIndex; i >= 0; i--) positionAds(i);
				} else {
					positionAds($adIndex);
				}
			}
			
		}

		function defineGlobals() {
			setAdWidth();
			setAdCount();
			setOffset();
			setAdHeight();
			setHeaderHeight();
			setFixTopPx();
			resizingHeader(false);
		}

		function fixForAnimations() {
			var interval = setInterval(update, 100);

			function update() {
				var offset = getOffset(),
					adHeight = getAdHeight(),
					headerHeight = getHeaderHeight(),
					fixTop = getFixTopPx();

				if (offset == $offset && headerHeight == $headerHeight && fixTop == $fixTop) clearInterval(interval);
				else {
					setOffset();
					setHeaderHeight();
					setFixTopPx();
					prepAds();
					adPositioner();
				}
			}
		}

		function getAdItems() {
			$items = $($settings.stickyContainer + ' ' + $settings.stickyItems);
		}

		function getAdCount() {
			getAdItems();
			return $items.length;
		}

		function getAdHeight() {
			$height = ($offset > $($settings.content).offset().top) ? $($settings.content).height() - ($offset - $($settings.content).offset().top) : $($settings.content).height();
			return ($(window).width() >= $settings.minScreenSize) ? $height / $adCount : 'auto';
		}

		function getFixTopPx() {
			if ($settings.stickyPaddingTop == 'immediate')
				$stickyPaddingTop = $offset - $headerHeight;
			else if (typeof $settings.stickyPaddingTop === 'string' && ($settings.stickyPaddingTop.charAt(0) == '.' || $settings.stickyPaddingTop.charAt(0) == '#'))
				$stickyPaddingTop = $($settings.stickyPaddingTop).offset().top - $headerHeight;
			else if (typeof $settings.stickyPaddingTop === 'number')
				$stickyPaddingTop = $settings.stickyPaddingTop;

			return $headerHeight + $stickyPaddingTop;
		}

		function getHeaderHeight() {
			return (!$settings.stickyHeader) ? 0 : $($settings.stickyHeader).height();
		}

		function getOffset() {
			return $($settings.stickyContainer).offset().top;
		}

		function getScreenSize() {
			$screenWidth = $(window).width();
		}

		function positionAds(adIndex) {
			var	ad = adIndex + 1;
			
			if (adIndex >= 0 && adIndex < $adCount) {
				var	fixedStyles = {
					position: 'fixed',
					top: $fixTop + 'px',
					left: $adInfo[adIndex].xOffset + 'px',
					bottom: 'auto',
					width: $adWidth + 'px'
				},
				absoluteStyles = {
					position: 'absolute',
					top: 'auto',
					left: 'auto',
					bottom: $adInfo[adIndex].absolutePosition + 'px',
					width: '100%'
				},
				internal = $($settings.stickyContainer).find('[data-ad="' + ad + '"]');

				// SCROLLING DOWN
				if ($y > $adInfo[adIndex].topStickPoint && $y < $adInfo[adIndex].bottomStickPoint && (!internal.hasClass('fixed'))) {
					internal.css(fixedStyles).addClass('fixed').removeClass('absolute').removeClass('static');
					$settings.onAdFix.call(internal);
				} else if ($y >= $adInfo[adIndex].bottomStickPoint && (!internal.hasClass('absolute'))) {
					internal.css(absoluteStyles).removeClass('fixed').addClass('absolute').removeClass('static');
					$settings.onAdEnd.call(internal);
				} else if ($y >= $adInfo[adIndex].topStickPoint && $y < $adInfo[adIndex].bottomStickPoint && (internal.hasClass('fixed')) && $resizingHeader) {
					internal.css(fixedStyles);
				} else if ($y < $adInfo[adIndex].topStickPoint && internal.hasClass('fixed')) {
					internal.css($staticStyles).removeClass('fixed').addClass('static');
				}

				// SCROLLING UP
				if (adIndex + 1 < $adCount && $y < $adInfo[(adIndex + 1)].topStickPoint) {
					var restatic = $($settings.stickyContainer).find('[data-ad="' + (ad + 1) + '"]');

					if (!restatic.hasClass('static') && restatic.hasClass('fixed')) {
						restatic.css($staticStyles).removeClass('fixed').removeClass('absolute').addClass('static');
						$settings.onAdReset.call(restatic);
					}
				}
			}
		}

		function prepAds() {
			$adInfo = [];
			$dontStick = false;
			var counter = 1;

			$items.each(function() {
				var el = $(this),
					html = el.html();
					
				var styles = {};

				if ($adHeight <= el.height()) {
					styles = {
						height: 'auto',
						paddingBottom: $settings.stickyPaddingBottom + 'px',
						position: 'relative'
					};
					$dontStick = true;
				} else {
					styles = {
						height: $adHeight + 'px',
						position: 'relative'
					};
				}

				el.css(styles)

				if (!el.children('.' + $settings.stickyInternalClass).length)
					el.empty().append('<div class="' + $settings.stickyInternalClass + '" data-ad="' + counter + '" style="transition: top ' + $settings.topTransitionSpeed + 's ease-in;">' + html + "</div>");

				var bottomStickPoint = (counter == $adCount) ? $offset - $headerHeight + ($adHeight * counter) - $stickyPaddingTop - el.find('[data-ad="' + counter + '"]').height() : $offset - $headerHeight + ($adHeight * counter) - $settings.stickyPaddingBottom - $stickyPaddingTop - el.find('[data-ad="' + counter + '"]').height(),
					absolutePosition = (counter == $adCount) ? 0 : $settings.stickyPaddingBottom;

				$adInfo.push({
					topStickPoint: $offset - $headerHeight - $stickyPaddingTop + ((counter - 1) * $adHeight),
					bottomStickPoint: bottomStickPoint,
					xOffset: el.offset().left,
					absolutePosition: absolutePosition
				});

				counter++;
			});
		}

		function resizingHeader(bool) {
			$resizingHeader = bool;
		}

		function setAdCount() {
			getAdItems();
			$adCount = $items.length;
		}

		function setAdHeight() {
			$height = ($offset > $($settings.content).offset().top) ? $($settings.content).height() - ($offset - $($settings.content).offset().top) : $($settings.content).height();
			$adHeight = ($(window).width() >= $settings.minScreenSize) ? $height / $adCount : 'auto';
		}

		function setAdIndex() {
			$adIndex = ($y - $offset + $stickyPaddingTop + $headerHeight <= 0) ? 0 : Math.floor(($y - $offset + $stickyPaddingTop + $headerHeight) / $adHeight);
		}

		function setAdWidth() {
			$adWidth = $($settings.stickyContainer).width();
		}

		function setFixTopPx() {
			if ($settings.stickyPaddingTop == 'immediate')
				$stickyPaddingTop = $offset - $headerHeight;
			else if (typeof $settings.stickyPaddingTop === 'string' && ($settings.stickyPaddingTop.charAt(0) == '.' || $settings.stickyPaddingTop.charAt(0) == '#'))
				$stickyPaddingTop = $($settings.stickyPaddingTop).offset().top - $headerHeight;
			else if (typeof $settings.stickyPaddingTop === 'number')
				$stickyPaddingTop = $settings.stickyPaddingTop;

			$fixTop = $headerHeight + $stickyPaddingTop;
		}

		function setHeaderHeight() {
			$headerHeight = (!$settings.stickyHeader) ? 0 : $($settings.stickyHeader).height();
		}

		function setOffset() {
			$offset = $($settings.stickyContainer).offset().top;
		}

		function setScrollPosition() {
			$y = $(document).scrollTop();
		}
	}

	$.fn.stickify.defaults = {
		animatedHeader: false,
		content: '#content',
		heightAnimations: false,
		minScreenSize: 1008,
		stickyContainer: '.ads',
		stickyHeader: false,
		stickyItems: '.ad',
		stickyInternalClass: 'internal',
		stickyPaddingTop: 30,
		stickyPaddingBottom: 30,
		topTransitionSpeed: 0,
		onAdFix: function() {},
		onAdEnd: function() {},
		onAdReset: function() {}
	};
}( jQuery ));
