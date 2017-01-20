// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('ionicApp', ['ionic',  'satellizer','ngTouch','ngCookies', 'ngCordova'])

//.constant('comunywearApiUrl', 'https://graph-dot-comunywear-eu.appspot.com/')
.constant('comunywearApiUrl', 'http://localhost:12080/')


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.factory('Camera', ['$q', function($q) {
 
  return {
    getPicture: function(options) {
      var q = $q.defer();
      
      navigator.camera.getPicture(function(result) {
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);
      
      return q.promise;
    }
  }
}])

// .config( ['$compileProvider',function( $compileProvider ){ 
//    $compileProvider.imgSrcSanitizationWhitelist(/^\s(https|http|file|blob|cdvfile):|data:image\//);

// }])

.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
])

.config(function($stateProvider, $urlRouterProvider, $authProvider,$httpProvider,comunywearApiUrl){

  $authProvider.loginUrl = comunywearApiUrl+'api/login'; 
  $httpProvider.defaults.withCredentials = true;

  $stateProvider
  .state('intro', {
    url: '/',
    templateUrl : 'templates/intro.html',
    controller : 'IntroCtrl'
  })
  
  .state('authenticate', {
    url: '/main',
    templateUrl : 'templates/authenticate.html',
    controller: 'authenticate'
  })

  .state('menuApp',{
    url: '/menu',
    abstract: true,
    templateUrl: 'templates/AppMenu.html',
    controller : 'menuAppCtrl'
  })
  
  .state('menuApp.home', {
    url: '/home',
    views:  {'menuContent': {
      templateUrl : 'templates/home.html',
      controller: 'home'
    }}
  })

  .state('menuApp.collection', {
    url: '/collection',
    views:  {'menuContent': {
      templateUrl : 'templates/collection.html',
      controller: 'collectionCtrl'
    }}
  })

  .state('menuApp.profil', {
    url: '/profil',
    views:  {'menuContent': {
      templateUrl : 'templates/profil.html',
      controller: 'profilCtrl'
    }}
  })

  .state('menuApp.following', {
    url: '/following',
    views:  {'menuContent': {
      templateUrl : 'templates/following.html',
      controller: 'followingCtrl'
    }}
  })

  .state('menuApp.follower', {
    url: '/follower',
    views:  {'menuContent': {
      templateUrl : 'templates/follower.html',
      controller: 'followingCtrl'
    }}
  })

  .state('menuApp.search', {
    url: '/search',
    views:  {'menuContent': {
      templateUrl : 'templates/search.html',
      controller: 'searchCtrl'
    }}
  })

  .state('menuApp.invitation', {
    url: '/invitation',
    views:  {'menuContent': {
      templateUrl : 'templates/invitation.html',
      controller: 'invitationCtrl'
    }}
  });


  $urlRouterProvider.otherwise("/");
})




.controller('IntroCtrl', function($scope,$http, $state,$ionicHistory, $ionicSlideBoxDelegate,$cookies,comunywearApiUrl){
  
  $http.get(comunywearApiUrl+'api/isLogged').success(function(response){ 
      if(response.isLogged){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $cookies.put('user',response.user);
        $state.go('menuApp.home');  
      }
  });

  $scope.logout = function() {
    console.log('ok');
    $http.get(comunywearApiUrl+'api/logout').success(function(response){ 
      $ionicHistory.nextViewOptions({
            disableBack: true
      });
      $state.go('intro');
    });
  };

  $scope.authentification = function(){
    $state.go('authenticate');
  };

})

.controller('MenuCtrl', function($scope,$http, $state,$ionicHistory, $ionicSideMenuDelegate,$cookies,comunywearApiUrl){

  $scope.logout = function() {
    console.log('ok');
    $http.get(comunywearApiUrl+'api/logout').success(function(response){ 
      $ionicHistory.nextViewOptions({
            disableBack: true
      });
      $cookies.remove('user');
      $state.go('intro');
    });
  };

})

.controller('menuAppCtrl', function($scope, $ionicSideMenuDelegate){

})



.controller('authenticate', function($scope, $ionicHistory, $http, $state, $auth, comunywearApiUrl,$cookies){

  $http.get(comunywearApiUrl+'api/isLogged').success(function(response){ 
      if(response.isLogged){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $cookies.put('user',response.user);
        $state.go('menuApp.home');  
      }
  });
  
  $scope.token = function() {
    $http.get(comunywearApiUrl+'api/csrfToken').success(function(response){ 
      console.log(response); 
      $cookies.put('laravel_token',response.token);
    });
  };

  $scope.auth = function() {
      var credentials = {
          email: $scope.auth.email,
          password: $scope.auth.password,
          _token:  $cookies.get('laravel_token')
      }
      
      $http.post(comunywearApiUrl+'api/login',credentials)
      .success(function(response){
        if(response.user){
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $cookies.put('user',response.user);
          $state.go('menuApp.home');
        }else{
          console.log('Wrong password');
          $('.auth-failed').show('slow');
        }
      })
      .error(function(response){
        console.log('Request Error');
        $('.auth-failed').show('slow');
      })
      ;
    }

})


.controller('home', function($scope,$http,$state,$ionicHistory,$ionicSideMenuDelegate, 
                              $ionicModal,$ionicNavBarDelegate,comunywearApiUrl,$cordovaCamera,
                              $cookies,$ionicSlideBoxDelegate,$ionicScrollDelegate,$timeout){

  $scope.onSwipeUp = function(){
    $('.home-sub-header').slideUp('fast');
  }

  $scope.onSwipeDown = function(){
    $('.home-sub-header').slideDown('fast');
  }

  $timeout(function(){
    $scope.showMe = true;
  })

  outfits = [];
  $scope.post = {
    status : "",
    picture : "",
    image : ""
  };

  $scope.loadMore = function() {
    if($scope.nextPost){
      $('.loading-view').css('display','block');
      $http.get(comunywearApiUrl+'api/posts/'+$scope.nextPost)
      .success(function(data){
        if(data.posts.length>0){
          $('.loading-view').css('display','none');
          $scope.posts = $scope.posts.concat(data.posts);
          $scope.nextPost = $scope.posts[$scope.posts.length-1].id;
          $ionicScrollDelegate.resize()
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }else{
          $('.loading-view').css('display','none');
        }
        
      });
    }
  };

  
  $scope.init = function(){
    $ionicScrollDelegate.scrollTop(true);
    $http.get(comunywearApiUrl+'api/posts')
    .success(function(data){
      $('.loading-view').css('display','none');
      $scope.posts = data.posts;
      $scope.user = data.user;
      $scope.user_outfits = data.user_outfits;
      $scope.nextPost = $scope.posts[$scope.posts.length-1].id;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });

    $http.get(comunywearApiUrl+'api/listOutfits')
    .success(function(data){
      $scope.outfits = data.outfits;
    });
  };
  
  
  $ionicModal.fromTemplateUrl('templates/modals/ItemModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.ItemModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/modals/PostPictureModal.html', {
    scope: $scope,
    animation: 'none'
  }).then(function(modal) {
    $scope.PostPictureModal = modal;
  });

  $scope.logout = function() {
    $http.get(comunywearApiUrl+'api/logout').success(function(response){ 
      $ionicHistory.nextViewOptions({
            disableBack: true
      });
      $state.go('intro');
    });

  };

  $scope.goBack = function() {
    console.log('back');
    $ionicHistory.goBack();
  };

  var degrees = 360;
  $scope.openItemModal = function(outfits){
  
    $element = $('.post-outfits-btn');

    $element.css('transition', '-webkit-transform 400ms ease-out');

    var rotate = function() {
        $element.css('-webkit-transform', 'rotate(' + degrees + 'deg)');
        degrees += 360;
    };

    var openModal = function(){
      $scope.ItemModal.show();
    }

    rotate();
    console.log(outfits);
    $scope.outfits = outfits;
    setTimeout(openModal, 400);
  
  };

  $scope.closeItemModal = function(){
    $scope.ItemModal.hide();
    $ionicSlideBoxDelegate.slide(0);
  };


  $scope.takePicture = function (source) {
      var options = {
         quality : 75,
         targetWidth: 600,
         targetHeight: 600,
         sourceType: source,
         destinationType : 0
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {
          $scope.post.picture = imageData;
          $(".post-outfit").hide();
          $(".done-post-picture-modal").hide();
          $(".post-picture").show();
          $(".next-post-picture-modal").show();
          $(".back-post-picture-modal").hide();
          $(".close-post-picture-modal").show();
          $scope.PostPictureModal.show();

      }, function(err) {
         console.log(err);
      });
    
   };

  $scope.openPostOutfitModal = function(){
      $(".post-picture").slideUp(function(){
        $(".post-outfit").slideDown();
        $(".next-post-picture-modal").hide();
        $(".close-post-picture-modal").hide();
        $(".back-post-picture-modal").show();
        $(".done-post-picture-modal").show();
      });

  };

  $scope.backPostPictureModal = function(){
    $(".post-outfit").slideUp(function(){
        $(".post-picture").slideDown();
        $(".back-post-picture-modal").hide();
        $(".done-post-picture-modal").hide();
        $(".next-post-picture-modal").show();
        $(".close-post-picture-modal").show();
    });
    $('.post-items').children('i').each(function(){
        $(this).hide('fast');
    });
  };

  $scope.addOutfitToPost = function(e,outfit){
    var pos = -1;
    for(var i = 0; i < outfits.length; i++) {
      if (outfits[i] == outfit.id) {pos = i; break;}
    }

    if(pos == -1){
      outfits.push(outfit.id);
      $(e.currentTarget).find('i').show('fast');
    }else{
      outfits.splice(pos,1);
      $(e.currentTarget).find('i').hide('fast');
    }
    
  };

  $scope.donePostOutfitModal = function(){

    var credentials = {
        status: $scope.post.status,
        outfits: JSON.stringify(outfits),
        image : $scope.post.picture,
        _token:  $cookies.get('laravel_token')
    };

    $http.post(comunywearApiUrl+'api/createPost',credentials)
      .success(function(response){
        $('.loading-view').css('display','block');
        $scope.init();
      })
      .error(function(response){
        console.log('Request Error');
      })
      ;

    $scope.closePostPictureModal();

  };

  $scope.closePostPictureModal = function(){
    $scope.PostPictureModal.hide();
    $('.post-items').children('i').each(function(){
        $(this).hide('fast');
    });
    outfits = [];
    $scope.post.status = "";
  };

  $scope.likePost = function(post){
      post.liked = post.liked?0:1;
      if(post.liked==1){
        $http.get(comunywearApiUrl+'api/likePost/'+post.id)
          .success(function(data){
              post.likes.push(data.like);
          });
      }else{
        $http.get(comunywearApiUrl+'api/unlikePost/'+post.id)
          .success(function(data){
              var pos = -1;
              for(var i = 0; i < post.likes.length; i++) {
                if (post.likes[i].user_id == $scope.user.id) {pos = i; break;}
              }
              if(pos>=0){
                post.likes.splice(pos,1);  
              }
              
          });
      }
      
    };



})

.controller('navBar', function($scope,$ionicHistory){
  


})

.controller('collectionCtrl', function($scope,$http,$ionicSideMenuDelegate,comunywearApiUrl,$timeout,$ionicScrollDelegate,$ionicPopover,
                                        $ionicModal,$cookies){

  $ionicModal.fromTemplateUrl('templates/modals/CatalogModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.CatalogModal = modal;
  });

  $scope.init = function(){
    $scope.outfits = [];
    $ionicScrollDelegate.scrollTop(true);
    $http.get(comunywearApiUrl+'api/outfits')
    .success(function(data){
      $('.loading-view').css('display','none');
      $scope.outfits = data.outfits;
      $('.grid-outfit-button').css('color','rgb(226,26,60)');
      $scope.nextOutfit = $scope.outfits[$scope.outfits.length-1].id;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });

    $http.get(comunywearApiUrl+'api/items')
    .success(function(data){
      $scope.items = data.items;
      console.log($scope.items);
      $scope.nextItem = $scope.items[$scope.items.length-1].id;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $timeout(function(){
    $scope.showMe = true;
  })
  $scope.loadMore = function() {
      if($scope.nextOutfit){

        $('.loading-view').css('display','block');
        $http.get(comunywearApiUrl+'api/outfits/'+$scope.nextOutfit)
        .success(function(data){
          if(data.outfits.length>0){
            $('.loading-view').css('display','none');
            $scope.outfits = $scope.outfits.concat(data.outfits);
            $scope.nextOutfit = $scope.outfits[$scope.outfits.length-1].id;
            $ionicScrollDelegate.resize()
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }else{
            $('.loading-view').css('display','none');
          }
          
        });

      }
    };

  $scope.loadMoreItems = function(){
      $http.get(comunywearApiUrl+'api/items/'+$scope.nextItem)
        .success(function(data){
          if(data.items.length>0){
            $('.loading-view').css('display','none');
            $scope.items = $scope.items.concat(data.items);
            $scope.nextItem = $scope.items[$scope.items.length-1].id;
            $ionicScrollDelegate.resize()
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }else{
            $('.loading-view').css('display','none');
          }
          
        });
  };

  $scope.line_outfit_items = function(){
      $('.line-outfit-button').css('color','rgb(226,26,60)');
      $('.grid-outfit-button').css('color','rgb(102,102,102)');
      $('.grid').children('.grid-item').each(function(){
          $(this).css('width',"98.5%");
          $(this).css('height',"98.5%");
      });
  };

  $scope.grid_outfit_items = function(){
      $('.grid-outfit-button').css('color','rgb(226,26,60)');
      $('.line-outfit-button').css('color','rgb(102,102,102)');
      $('.grid').children('.grid-item').each(function(){
          $(this).css('width',"31%");
          $(this).css('height',"100px");
      });
  };

  // $scope.changeSize = function(e){
      
  //     if($(e.currentTarget).hasClass('grid-item-xl')){
  //         $( e.currentTarget ).removeClass('grid-item-xl');
  //         $(e.currentTarget).css('width','30%');
  //         $(e.currentTarget).css('height',"100px");
  //     }else{
  //         $('.grid').children('.grid-item').each(function(){
  //             $(this).css('width',"30%");
  //             $(this).removeClass('grid-item-xl');
  //         });
  //         $( e.currentTarget ).addClass('grid-item-xl');
  //         $(e.currentTarget).css('width',"99%");
  //         $(e.currentTarget).css('height',"99%");
  //     }

  // }

    $ionicPopover.fromTemplateUrl('templates/popovers/addOutfitPopover.html', {
        scope: $scope
     }).then(function(popover) {
        $scope.popover = popover;
     });

      $scope.openPopover = function($event) {
        $scope.popover.show($event);
     };

     $scope.openCatalogModal = function(){
        $scope.CatalogModal.show();
        $scope.popover.hide();
     };

     $scope.closeCatalogModal = function(){
        $scope.CatalogModal.hide();
     };

     $scope.selected_items = [];
     $scope.addItemToOutfit = function(e,item){
        var pos = -1;
        for(var i = 0; i < $scope.selected_items.length; i++) {
          if ($scope.selected_items[i] == item.id) {pos = i; break;}
        }

        if(pos == -1){
          $scope.selected_items.push(item.id);
          $(e.currentTarget).find('i').show('fast');
        }else{
          console.log('hide '+ $scope.selected_items[pos]);
          $scope.selected_items.splice(pos,1);
          $(e.currentTarget).find('i').hide('fast');
        }
        
      };

      $scope.doneCatalogModal = function(){
        var credentials = {
            items: JSON.stringify($scope.selected_items),
            _token:  $cookies.get('laravel_token')
        };

        $http.post(comunywearApiUrl+'api/createOutfit',credentials)
          .success(function(response){
            $('.loading-view').css('display','block');
            $scope.init();
          })
          .error(function(response){
            console.log('Request Error');
          })
          ;

          $scope.CatalogModal.hide();
      };


})

.controller('profilCtrl', function($scope,$http,$state,$ionicSideMenuDelegate, $ionicModal,$ionicNavBarDelegate,comunywearApiUrl,
                                  $timeout,$ionicScrollDelegate,$ionicSlideBoxDelegate,$ionicPopover,$cookies){

  $scope.init = function(){
    $ionicScrollDelegate.scrollTop(true);
    $http.get(comunywearApiUrl+'api/postsProfil')
    .success(function(data){
      $('.loading-view').css('display','none');
      $scope.posts = data.posts;
      $scope.nextPost = $scope.posts[$scope.posts.length-1].id;
      $scope.user = data.user;
      $scope.user_outfits = data.user_outfits;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });

    $http.get(comunywearApiUrl+'api/listOutfits')
    .success(function(data){
      if(data){
        $scope.allOutfits = data.outfits;
      }
    });
  };

  $timeout(function(){
    $scope.showMe = true;
  })
  $scope.loadMore = function() {
      if($scope.nextPost){
        $('.loading-view').css('display','block');
        $http.get(comunywearApiUrl+'api/postsProfil/'+$scope.nextPost)
        .success(function(data){
          if(data.posts.length>0){
            $('.loading-view').css('display','none');
            $scope.posts = $scope.posts.concat(data.posts);
            $scope.nextPost = $scope.posts[$scope.posts.length-1].id;
            $ionicScrollDelegate.resize()
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }else{
            $('.loading-view').css('display','none');
          }
          
        });
      }
    };


    $scope.likePost = function(post){
      post.liked = post.liked?0:1;
      if(post.liked==1){
        $http.get(comunywearApiUrl+'api/likePost/'+post.id)
          .success(function(data){
              post.likes.push(data.like);
          });
      }else{
        $http.get(comunywearApiUrl+'api/unlikePost/'+post.id)
          .success(function(data){
              var pos = -1;
              for(var i = 0; i < post.likes.length; i++) {
                if (post.likes[i].user_id == $scope.user.id) {pos = i; break;}
              }
              if(pos>=0){
                post.likes.splice(pos,1);  
              }
              
          });
      }
      
    };


    $ionicModal.fromTemplateUrl('templates/modals/ItemModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.ItemModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/OutfitCatalogModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.CatalogModal = modal;
    });

    var degrees = 360;
    $scope.openItemModal = function(outfits){
    
      $element = $('.post-outfits-btn');

      $element.css('transition', '-webkit-transform 400ms ease-out');

      var rotate = function() {
          $element.css('-webkit-transform', 'rotate(' + degrees + 'deg)');
          degrees += 360;
      };

      var openModal = function(){
        $scope.ItemModal.show();
      }

      rotate();
      console.log(outfits);
      $scope.outfits = outfits;
      setTimeout(openModal, 400);
    
    };

    $scope.closeItemModal = function(){
      $scope.ItemModal.hide();
      $ionicSlideBoxDelegate.slide(0);
    };

    $ionicPopover.fromTemplateUrl('templates/popovers/addOutfitToPostPopover.html', {
        scope: $scope
     }).then(function(popover) {
        $scope.popover = popover;
     });

      $scope.openPopover = function($event,post) {
        $scope.selected_post = post;
        $scope.popover.show($event);
     };

     $scope.openCatalogModal = function(){
        $scope.CatalogModal.show();
        $scope.popover.hide();
     };

     $scope.closeCatalogModal = function(){
        $scope.CatalogModal.hide();
     };

     $scope.selected_outfits = [];
     $scope.addOutfitToPost = function(e,item){
        
        var pos = -1;
        for(var i = 0; i < $scope.selected_outfits.length; i++) {
          if ($scope.selected_outfits[i] == item.id) {pos = i; break;}
        }

        if(pos == -1){
          $scope.selected_outfits.push(item.id);
          $(e.currentTarget).find('i').show('fast');
        }else{
          $scope.selected_outfits.splice(pos,1);
          $(e.currentTarget).find('i').hide('fast');
        }
      };

      $scope.doneOutfitCatalogModal = function(){
        var credentials = {
            outfits: JSON.stringify($scope.selected_outfits),
            post_id: $scope.selected_post.id,
            _token:  $cookies.get('laravel_token')
        };

        $http.post(comunywearApiUrl+'api/addOutfit',credentials)
          .success(function(response){
            $('.loading-view').css('display','block');
            $scope.init();
          })
          .error(function(response){
            console.log('Request Error');
          })
          ;

          $scope.CatalogModal.hide();
      };

      $scope.deletePost = function(){
        $scope.popover.hide();
        $http.get(comunywearApiUrl+'api/deletePost/'+$scope.selected_post.id)
        .success(function(data){
            if(data==1){
              var pos = -1;
              for(var i = 0; i < $scope.posts.length; i++) {
                if ($scope.posts[i].id == $scope.selected_post.id) {pos = i; break;}
              }
              if(pos>=0){
                $scope.posts.splice(pos,1);
              }
            }
        });
      };


})

.controller('followingCtrl', function($scope,$http,$ionicSideMenuDelegate,comunywearApiUrl,$timeout,$ionicScrollDelegate){

    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true;
    $scope.followings_exit = true;

    $scope.init = function(){
      $http.get(comunywearApiUrl+'api/following')
      .success(function(data){
        $('.loading-view').css('display','none');
        if(data.followings.length !=0){
          $scope.followings = data.followings;
          $scope.nextPost = $scope.followings[$scope.followings.length-1].id;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }else{
          $scope.followings_exit = false;
        }
      });
    };

    $timeout(function(){
      $scope.showMe = true;
    })

    $scope.loadMore = function() {
        if($scope.nextPost){
          $('.loading-view').css('display','block');
          $http.get(comunywearApiUrl+'api/following/'+$scope.nextPost)
          .success(function(data){
            if(data.followings.length>0){
              $('.loading-view').css('display','none');
              $scope.followings = $scope.followings.concat(data.followings);
              $scope.nextPost = $scope.followings[$scope.followings.length-1].id;
              $ionicScrollDelegate.resize()
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }else{
              $('.loading-view').css('display','none');
            }
            
          });
        }
      };

    $scope.delete = function(following){
      $scope.followings.splice($scope.followings.indexOf(following), 1);
      $http.get(comunywearApiUrl+'api/following/delete/'+following.id)
      .success(function(){
        if($scope.followings.length == 0){
          $scope.followings_exit = false;
        }
      });
      
    };


})

.controller('followerCtrl', function($scope,$http,$ionicSideMenuDelegate,comunywearApiUrl,$timeout,$ionicScrollDelegate){

  $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true;
    $scope.followers_exit = true;

    $scope.init = function(){
      $http.get(comunywearApiUrl+'api/follower')
      .success(function(data){
        $('.loading-view').css('display','none');
        if(data.followers != 0){
          $scope.followers = data.followers;
          $scope.nextPost = $scope.followers[$scope.followers.length-1].id;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }else{
          $scope.followers_exit = false;
        }
      });
    };


    $timeout(function(){
      $scope.showMe = true;
    })

    $scope.loadMore = function() {
        if($scope.nextPost){
          $('.loading-view').css('display','block');
          $http.get(comunywearApiUrl+'api/follower/'+$scope.nextPost)
          .success(function(data){
            if(data.followers.length>0){
              $('.loading-view').css('display','none');
              $scope.followers = $scope.followers.concat(data.followers);
              $scope.nextPost = $scope.followers[$scope.followers.length-1].id;
              $ionicScrollDelegate.resize()
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }else{
              $('.loading-view').css('display','none');
            }
            
          });
        }
      };

    $scope.delete = function(follower){
      $scope.followers.splice($scope.followers.indexOf(follower), 1);
      $http.get(comunywearApiUrl+'api/follower/delete/'+follower.id)
      .success(function(){
        if($scope.followers.length == 0){
          $scope.followers_exit = false;
        }
      });
    };

})


.controller('searchCtrl', function($scope,$http,$ionicSideMenuDelegate,comunywearApiUrl,$timeout,$ionicScrollDelegate){

    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true;

    $scope.init = function(){
      $('.loading-view').css('display','block');
      $http.get(comunywearApiUrl+'api/search')
      .success(function(data){
        if(data.accounts.length>0){
          $('.loading-view').css('display','none');
          $scope.accounts =data.accounts;
          $scope.nextContact = $scope.accounts[$scope.accounts.length-1].id;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }else{
          $('.loading-view').css('display','none');
          console.log("No more friends to show");
        }
        
      });
    };

    $timeout(function(){
      $scope.showMe = true;
    })

    $scope.loadMore = function(){
      if($scope.nextContact){
          $('.loading-view').css('display','block');
          $http.get(comunywearApiUrl+'api/search/'+$scope.nextContact)
          .success(function(data){
            if(data.accounts.length>0){
              $('.loading-view').css('display','none');
              $scope.accounts = $scope.accounts.concat(data.accounts);
              $scope.nextContact = $scope.accounts[$scope.accounts.length-1].id;
              $ionicScrollDelegate.resize()
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }else{
              $('.loading-view').css('display','none');

            }
            
          });
        }
    };

    $scope.sendRequest = function(account){
      $scope.accounts.splice($scope.accounts.indexOf(account), 1);
      $http.get(comunywearApiUrl+'api/sendRequest/'+account.id)
        .success(function(data){
          //
        });
    };

})

.controller('invitationCtrl', function($scope,$http,$ionicSideMenuDelegate,comunywearApiUrl,$timeout,$ionicScrollDelegate){

    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true;

    $scope.init = function(){
      $('.loading-view').css('display','block');
      $http.get(comunywearApiUrl+'api/invitation')
      .success(function(data){
        if(data.invitations.length>0){
          $('.loading-view').css('display','none');
          $scope.invitations =data.invitations;
          $scope.nextInvitation = $scope.invitations[$scope.invitations.length-1].id;
          //$scope.$broadcast('scroll.infiniteScrollComplete');
        }else{
          $('.loading-view').css('display','none');
          console.log("No more friends to show");
          $scope.invitation_exist = false;
        }
        
      });
    };

    $timeout(function(){
      $scope.showMe = true;
    })

    $scope.loadMore = function(){
      if($scope.nextInvitation){
          $('.loading-view').css('display','block');
          $http.get(comunywearApiUrl+'api/invitation/'+$scope.nextInvitation)
          .success(function(data){
            if(data.invitations.length>0){
              $('.loading-view').css('display','none');
              $scope.invitations = $scope.invitations.concat(data.invitations);
              $scope.nextInvitation = $scope.invitations[$scope.invitations.length-1].id;
              $ionicScrollDelegate.resize()
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }else{
              $('.loading-view').css('display','none');
            }
          });
        }
    };


    $scope.accepteInvitation = function(invitation){
      $scope.invitations.splice($scope.invitations.indexOf(invitation), 1);
      $http.get(comunywearApiUrl+'api/accepteInvitation/'+invitation.id)
        .success(function(data){
          //
        });
    };

    $scope.refuseInvitation = function(invitation){
      $scope.invitations.splice($scope.invitations.indexOf(invitation), 1);
      $http.get(comunywearApiUrl+'api/refuseInvitation/'+invitation.id)
        .success(function(data){
          //
        });
    };

})


.filter('dateToISO', function() {
  return function(input) {
    return new Date(input).toISOString();
  };
});



