# frozen_string_literal: true

require 'sidekiq/web'
require 'sidekiq-scheduler/web'

Rails.application.routes.draw do
  # For details on the DSL available within this
  # file, see http://guides.rubyonrails.org/routing.html

  authenticate :user, lambda { |u| u.is_superadmin } do
    mount Sidekiq::Web => '/sidekiq'
  end

  scope :api, module: :api, defaults: { format: :json } do
    scope :v1, module: :v1 do
      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        registrations: 'api/v1/registrations',
      }

      get :machine_translations_usage, to: 'machine_translations#usage'
      get :machine_translations_target_languages, to: 'machine_translations#target_languages'
      get :machine_translations_source_languages, to: 'machine_translations#source_languages'

      resources :organizations do
        get :subscription, to: 'organizations#subscription'
        delete :cancel_subscription, to: 'organizations#cancel_subscription'
        post :reactivate_subscription, to: 'organizations#reactivate_subscription'
        put :change_subscription_plan, to: 'organizations#change_subscription_plan'
        get :image, to: 'organizations#image'
        post :image, to: 'organizations#image_create'
        delete :image, to: 'organizations#image_destroy'
        resources :members, only: [:create, :index, :destroy, :update], controller: "organization_users"
        get :project_members, to: 'organization_users#project_users'
      end

      get 'instance', to: 'instance#show'

      get :recently_viewed_projects, to: 'projects#recently_viewed'

      resources :projects, only: [:create, :index, :destroy, :show, :update] do
        post :import
        get 'exports/:id', to: 'projects#export'
        get :activity
        post :transfer
        get :project_columns, to: 'project_columns#show'
        put :project_columns, to: 'project_columns#update'
        resources :keys, only: [:create, :show, :index, :destroy, :update] do
          get :activity
        end
        delete 'keys', to: 'keys#destroy_multiple'
        resources :export_configs, only: [:create, :index, :destroy, :update] do
          resources :language_configs, only: [:create, :index, :destroy, :update]
          resources :releases, only: [:create]
          get :release, to: 'releases#release'
        end

        # Releases
        get 'releases', to: 'releases#index'
        delete 'releases', to: 'releases#destroy_multiple'

        # Post processing rules
        resources :post_processing_rules, only: [:create, :index, :destroy, :update]
        delete 'post_processing_rules', to: 'post_processing_rules#destroy_multiple'

        # Validations and violations
        resources :validations, only: [:create, :index, :destroy, :update]
        resources :validation_violations, only: [:index, :destroy]
        get :validation_violations_count, to: 'validation_violations#count'

        # Languages
        resources :languages, only: [:create, :index, :destroy, :update] do
          post :machine_translate, to: 'machine_translations#machine_translate_language'
        end
        delete 'languages', to: 'languages#destroy_multiple'

        resources :translations, only: [:create] do
          post :machine_translation_suggestion, to: 'machine_translations#suggestion'
        end
        resources :members, only: [:create, :index, :destroy, :update], controller: "project_users"
        get :image, to: 'projects#image'
        post :image, to: 'projects#image_create'
        delete :image, to: 'projects#image_destroy'
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

  root to: 'application#app'
  get '*path', to: 'application#app', constraints: lambda { |req|
    # https://github.com/rails/rails/issues/31228
    req.path.exclude? 'rails/active_storage'
  }
end
