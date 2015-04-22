(function() {
'use strict';

angular.module('ngCropper', ['ng'])
    .directive('cropper', function () {
        return {
            restrict: 'E',
            scope: {
                imageIn: '=',
                imageOut: '=',
                compression: '=',
                outWidth: '=',
                outHeight: '=',
                cropBox: '=',
                config: '='
            },
            template: '<img ng-src="{{ imageIn }}" />',
            link: function (scope, element, attrs) {
                var cropperContainer = element[0];
                var cropperImg = cropperContainer.querySelector('img');

                // réglage du ratio
                scope.config.aspectRatio = scope.outWidth / scope.outHeight;

                // sauvegarde l'image quand le recadrage est fini
                scope.config.dragend = function (e) {
                    updateImageOut(true);
                }

                // dès que le cropper est prêt
                scope.config.built = function () {

                    // initialisation de la zone de crop si on a une valeur
                    if (scope.cropBox.hasOwnProperty('width')) {
                        $(cropperImg).cropper('setCropBoxData', scope.cropBox);
                    }

                    //initialisation de l'image en sortie 
                    updateImageOut(true);
                };

                // sauvegarde l'image si le taux de compression change
                scope.$watch('compression', function (currentValue, previousValue) {
                    if (currentValue != previousValue) {
                        updateImageOut(false);
                    }
                });

                // reset du cropper si les dimensions changent
                scope.$watchGroup(['outWidth','outHeight'] , function (currentValues, previousValues, scope) {
                    if ((currentValues[0] != previousValues[0]) || (currentValues[1] != previousValues[1])) {
                        scope.config.aspectRatio = scope.outWidth / scope.outHeight;
                        $(cropperImg).cropper('destroy');
                        $(cropperImg).cropper(scope.config);
                    }
                });

                // initialisation du cropper dès que l'image est prête
                cropperImg.onload = function () {
                    $(cropperImg).cropper(scope.config);
                };

                // mise à jour de l'image en sortie
                function updateImageOut(async) {

                    // canvas contenant l'image recadrée et redimensionnée
                    var canvas = $(cropperImg).cropper('getCroppedCanvas', {
                        width: scope.outWidth,
                        height: scope.outHeight,
                        fillColor: '#fff' // conversion transparent -> blanc
                    });

                    // image au format jpeg avec le taux de compression demandé
                    var image = canvas.toDataURL('image/jpeg', scope.compression / 100);

                    // zone de crop
                    var data = $(cropperImg).cropper('getCropBoxData');

                    // mise à jour des valeurs
                    if (async) {
                        scope.$apply(function (scope) {
                            scope.cropBox = data;
                            scope.imageOut = image;
                        });
                    } else {
                        scope.cropBox = data;
                        scope.imageOut = image;
                    }
                }
            }
        };
    });
})();
