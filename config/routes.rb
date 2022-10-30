# frozen_string_literal: true

require 'sidekiq/web'
require 'sidekiq-scheduler/web'

Rails
  .application
  .routes
  .draw do
    # For details on the DSL available within this
    # file, see http://guides.rubyonrails.org/routing.html

    authenticate :user, lambda { |u| u.is_superadmin } do
      mount Sidekiq::Web => '/sidekiq'
    end

    scope :api, module: :api, defaults: { format: :json } do
      scope :v1, module: :v1 do
        mount_devise_token_auth_for 'User', at: 'auth', controllers: { registrations: 'api/v1/registrations' }

        # Machine translations
        get :machine_translations_usage, to: 'machine_translations#usage'
        get :machine_translations_target_languages, to: 'machine_translations#target_languages'
        get :machine_translations_source_languages, to: 'machine_translations#source_languages'

        resources :organizations do
          get :subscription, to: 'organizations#subscription'
          get :custom_subscription, to: 'organizations#custom_subscription'
          post :activate_custom_subscription, to: 'organizations#activate_custom_subscription'
          delete :cancel_subscription, to: 'organizations#cancel_subscription'
          post :reactivate_subscription, to: 'organizations#reactivate_subscription'
          put :change_subscription_plan, to: 'organizations#change_subscription_plan'
          get :image, to: 'organizations#image'
          post :image, to: 'organizations#image_create'
          delete :image, to: 'organizations#image_destroy'
          resources :members, only: [:create, :index, :destroy, :update], controller: 'organization_users'
          get :project_members, to: 'organization_users#project_users'
          resources :invites, only: [:create, :index, :destroy], controller: 'organization_invites'

          # Organization machine translation
          put :machine_translation, to: 'organization_machine_translation#update'

          # Validations
          resources :validations, only: [:create, :index, :destroy, :update], controller: 'validations'

          # Forbidden words lists
          resources :forbidden_words_lists,
                    only: [:create, :index, :update, :destroy],
                    controller: 'forbidden_words_lists'
        end

        get 'instance', to: 'instance#show'
        put 'instance/domain-filter', to: 'instance#domain_filter'
        put 'instance/sign-up-enabled', to: 'instance#sign_up_enabled'
        get 'instance/users', to: 'instance_users#index'

        get :recently_viewed_projects, to: 'projects#recently_viewed'

        resources :projects, only: [:create, :index, :destroy, :show, :update] do
          post :import
          get 'exports/:id', to: 'projects#export'
          get :activity
          post :transfer

          # Project columns
          get :project_columns, to: 'project_columns#show'
          put :project_columns, to: 'project_columns#update'

          # Keys
          resources :keys, only: [:create, :show, :index, :destroy, :update] do
            get :activity
            resources :placeholders, only: [:create, :index, :destroy]
            resources :tags, only: [:create, :destroy], controller: 'key_tags'
          end
          delete 'keys', to: 'keys#destroy_multiple'

          # Export configs
          delete 'export_configs', to: 'export_configs#destroy_multiple'
          resources :export_configs, only: [:create, :index, :destroy, :update] do
            resources :language_configs, only: [:create, :index, :destroy, :update]
            resources :releases, only: [:create]
            get :release, to: 'releases#release'
          end

          # Flavors
          delete 'flavors', to: 'flavors#destroy_multiple'
          resources :flavors, only: [:create, :index, :destroy, :update]

          # Releases
          get 'releases', to: 'releases#index'
          delete 'releases', to: 'releases#destroy_multiple'

          # Post processing rules
          resources :post_processing_rules, only: [:create, :index, :destroy, :update]
          delete 'post_processing_rules', to: 'post_processing_rules#destroy_multiple'

          # Languages
          resources :languages, only: [:create, :index, :show, :destroy, :update] do
            post :machine_translate, to: 'machine_translations#machine_translate_language'
          end
          delete 'languages', to: 'languages#destroy_multiple'

          # Translations
          resources :translations, only: [:create] do
            post :machine_translation_suggestion, to: 'machine_translations#suggestion'
          end

          # Project image
          get :image, to: 'projects#image'
          post :image, to: 'projects#image_create'
          delete :image, to: 'projects#image_destroy'

          # Project users
          resources :members, only: [:create, :index, :destroy, :update], controller: 'project_users'

          # Validations
          resources :validations, only: [:create, :index, :destroy, :update]
          post :validations_check, to: 'validations#recheck'
          post :placeholders_check, to: 'placeholders#check'

          # Validation violations
          resources :validation_violations, only: [:index, :destroy, :update] do
            put :ignore, to: 'validation_violations#ignore'
          end
          get :validation_violations_count, to: 'validation_violations#count'
          delete :validation_violations, to: 'validation_violations#destroy_multiple'
          put :validation_violations, to: 'validation_violations#update_multiple'

          # Background jobs
          resources :background_jobs, only: [:index]

          # Project invites
          resources :invites, only: [:create, :index, :destroy], controller: 'project_invites'

          # Forbidden words lists
          resources :forbidden_words_lists,
                    only: [:create, :index, :update, :destroy],
                    controller: 'forbidden_words_lists'

          # Tags
          resources :tags, only: [:create, :index, :update, :destroy]

          # WordPress Polylang integration
          get 'wordpress_polylang_connection', to: 'wordpress_polylang_connections#show'
          put 'wordpress_polylang_connection', to: 'wordpress_polylang_connections#update'
          get 'wordpress_polylang_connection/contents', to: 'wordpress_polylang_connections#contents'
          post 'wordpress_polylang_connection/pull', to: 'wordpress_polylang_connections#pull'
          post 'wordpress_polylang_connection/push', to: 'wordpress_polylang_connections#push'
          post 'wordpress_polylang_connection/import', to: 'wordpress_polylang_connections#import'
          get 'wordpress_polylang_connection/website_reachable', to: 'wordpress_polylang_connections#website_reachable'
          get 'wordpress_polylang_connection/wordpress_rest_activated',
              to: 'wordpress_polylang_connections#wordpress_rest_activated'
          get 'wordpress_polylang_connection/authentication_valid',
              to: 'wordpress_polylang_connections#authentication_valid'
        end

        resources :access_tokens, only: [:create, :index, :destroy]
        resources :licenses, only: [:create, :index, :destroy]
        get 'licenses/current', to: 'licenses#current'
        resources :country_codes, only: [:index]
        resources :language_codes, only: [:index]
        resources :user_licenses, only: [:index]
        get 'dashboard/activity', to: 'dashboard#activity'
        get 'users/info', to: 'users#info'
        get 'users/image', to: 'users#image'
        post 'users/image', to: 'users#image_create'
        delete 'users/image', to: 'users#image_destroy'
      end
    end

    mount ActionCable.server => '/cable'

    root to: 'application#app'
    get '*path',
        to: 'application#app',
        constraints:
          lambda { |req|
            # https://github.com/rails/rails/issues/31228
            req.path.exclude? 'rails/active_storage'
          }
  end
