# frozen_string_literal: true

Rails.application.routes.draw do
  # For details on the DSL available within this
  # file, see http://guides.rubyonrails.org/routing.html
  scope :api, module: :api, defaults: { format: :json } do
    scope :v1, module: :v1 do
      mount_devise_token_auth_for 'User', at: 'auth'

      resources :projects, only: [:create, :index, :destroy, :show, :update] do
        post :import
        get :export
        get :activity
        get :project_columns, to: 'project_columns#show'
        put :project_columns, to: 'project_columns#update'
        resources :keys, only: [:create, :index, :destroy, :update]
        delete 'keys', to: 'keys#destroy_multiple'
        resources :languages, only: [:create, :index, :destroy, :update]
        delete 'languages', to: 'languages#destroy_multiple'
        resources :translations, only: [:create, :update]
        resources :members, only: [:create, :index, :destroy]
      end
      
      resources :access_tokens, only: [:create, :index, :destroy]
      resources :country_codes, only: [:index]
      get 'dashboard/activity', to: 'dashboard#activity'
      get 'users/image', to: 'users#image'
      post 'users/image', to: 'users#upload_image'
    end
  end

  root to: 'application#app'
  get '*path', to: 'application#app', constraints: lambda { |req|
    # https://github.com/rails/rails/issues/31228
    req.path.exclude? 'rails/active_storage'
  }
end