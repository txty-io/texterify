require 'rails_helper'
require 'json'

RSpec.describe Api::V1::ProjectsController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = FactoryBot.create(:user)
      @auth_params = sign_in(@user)
    end
  end

  describe 'GET index' do
    it 'responds with json by default' do
      get '/api/v1/projects'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get '/api/v1/projects', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'has status code 403 if not logged in', :skip_before do
      get '/api/v1/projects'
      expect(response.status).to eq(403)
    end

    it 'has status code 200 if logged in and returns empty array' do
      get '/api/v1/projects', headers: @auth_params

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data']).to eq([])
      expect(body['meta']['total']).to eq(0)
    end

    it 'returns projects', :skip_before do
      number_of_projects = 11
      user = FactoryBot.create(:user_with_projects, projects_count: number_of_projects)
      auth_params = sign_in(user)
      get '/api/v1/projects', headers: auth_params

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(10)
      expect(body['data'][0].keys).to contain_exactly('attributes', 'id', 'relationships', 'type')
      expect(body['data'][0]['attributes'].keys).to contain_exactly('description', 'id', 'name', 'current_user_role', 'current_user_role_source', 'all_features', 'enabled_features', 'validate_leading_whitespace', 'validate_trailing_whitespace', 'validate_double_whitespace', 'validate_https')
      expect(body['meta']['total']).to eq(number_of_projects)
    end

    it 'returns projects with 2 per page', :skip_before do
      number_of_projects = 4
      per_page = 2
      user = FactoryBot.create(:user_with_projects, projects_count: number_of_projects)
      auth_params = sign_in(user)
      get '/api/v1/projects', headers: auth_params, params: { per_page: per_page }

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(per_page)
      expect(body['meta']['total']).to eq(number_of_projects)
    end

    it 'returns 10 projects if per_page is set to 0', :skip_before do
      number_of_projects = 11
      per_page = 0
      user = FactoryBot.create(:user_with_projects, projects_count: number_of_projects)
      auth_params = sign_in(user)
      get '/api/v1/projects', headers: auth_params, params: { per_page: per_page }

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(10)
      expect(body['meta']['total']).to eq(number_of_projects)
    end

    it 'returns the first 2 projects if page is set to 1 and per_page to 2', :skip_before do
      number_of_projects = 4
      per_page = 2
      user = FactoryBot.create(:user_with_projects, projects_count: number_of_projects)
      auth_params = sign_in(user)
      get '/api/v1/projects', headers: auth_params, params: { per_page: per_page, page: 1 }

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      user_projects_ordered = user.projects.order('lower(name) ASC')
      expect(body['data'].length).to eq(per_page)
      expect(body['data'][0]['id']).to eq(user_projects_ordered[0].id)
      expect(body['data'][1]['id']).to eq(user_projects_ordered[1].id)
      expect(body['meta']['total']).to eq(number_of_projects)
    end

    it 'returns the 3rd and 4th project if page is set to 2 and per_page to 2', :skip_before do
      number_of_projects = 4
      per_page = 2
      user = FactoryBot.create(:user_with_projects, projects_count: number_of_projects)
      auth_params = sign_in(user)
      get '/api/v1/projects', headers: auth_params, params: { per_page: per_page, page: 2 }

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      user_projects_ordered = user.projects.order('lower(name) ASC')
      expect(body['data'].length).to eq(per_page)
      expect(body['data'][0]['id']).to eq(user_projects_ordered[2].id)
      expect(body['data'][1]['id']).to eq(user_projects_ordered[3].id)
      expect(body['meta']['total']).to eq(number_of_projects)
    end

    it 'is possible to provide a search criteria', :skip_before do
      number_of_projects = 1
      user = FactoryBot.create(:user_with_projects, projects_count: number_of_projects)
      auth_params = sign_in(user)
      get '/api/v1/projects', headers: auth_params, params: { search: "'no project has this name--" }

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(0)
      expect(body['meta']['total']).to eq(0)
    end
  end

  describe 'POST create' do
    it 'responds with json by default' do
      post '/api/v1/projects'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      post '/api/v1/projects', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'creates a new project with name' do
      name = 'Test Name'
      post '/api/v1/projects', params: { name: name }, headers: @auth_params, as: :json

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].keys).to contain_exactly('id', 'type', 'relationships', 'attributes')
      expect(body['data']['attributes'].keys).to contain_exactly('id', 'name', 'description', 'current_user_role', 'current_user_role_source', 'all_features', 'enabled_features', 'validate_leading_whitespace', 'validate_trailing_whitespace', 'validate_double_whitespace', 'validate_https')
      expect(body['data']['attributes']['name']).to eq(name)
      expect(body['data']['attributes']['description']).to eq(nil)
    end

    it 'creates a new project with name and description' do
      name = 'Test Name'
      description = 'Test Description'
      post '/api/v1/projects', params: { name: name, description: description }, headers: @auth_params, as: :json

      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].keys).to contain_exactly('id', 'type', 'relationships', 'attributes')
      expect(body['data']['attributes'].keys).to contain_exactly('id', 'name', 'description', 'current_user_role', 'current_user_role_source', 'all_features', 'enabled_features', 'validate_leading_whitespace', 'validate_trailing_whitespace', 'validate_double_whitespace', 'validate_https')
      expect(body['data']['attributes']['name']).to eq(name)
      expect(body['data']['attributes']['description']).to eq(description)
      expect(body['data']['relationships']['project_columns']['data'].length).to eq(1)
    end

    it 'fails to create a new project without name' do
      post '/api/v1/projects', params: {}, headers: @auth_params, as: :json

      expect(response.status).to eq(400)
      body = JSON.parse(response.body)
      expect(body.keys).to contain_exactly('errors')
      expect(body['errors']['name'].length).to eq(1)
      expect(body['errors']['name'][0]['error']).to eq('blank')
    end
  end

  describe 'PUT update' do
    permissions_update = {
      'translator' => 403,
      'developer' => 403,
      'manager' => 200,
      'owner' => 200
    }

    it 'responds with json by default' do
      put '/api/v1/projects/1'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      put '/api/v1/projects/1', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    permissions_update.each do |permission, expected_response_status|
      it "#{expected_response_status == 200 ? 'succeeds' : 'fails'} to update a projects name as #{permission} of project" do
        project = Project.new(name: 'Old Name')
        project.save!

        project_user = ProjectUser.new
        project_user.user_id = @user.id
        project_user.project_id = project.id
        project_user.role = permission
        project_user.save!

        new_name = 'New Name'
        put "/api/v1/projects/#{project.id}", params: { name: new_name }, headers: @auth_params, as: :json

        expect(response.status).to eq(expected_response_status)
        if expected_response_status == 200
          body = JSON.parse(response.body)
          expect(body['data'].keys).to contain_exactly('id', 'type', 'relationships', 'attributes')
          expect(body['data']['attributes'].keys).to contain_exactly('id', 'name', 'description', 'current_user_role', 'current_user_role_source', 'all_features', 'enabled_features', 'validate_leading_whitespace', 'validate_trailing_whitespace', 'validate_double_whitespace', 'validate_https')
          expect(body['data']['attributes']['name']).to eq(new_name)
          expect(body['data']['attributes']['description']).to eq(nil)
        end
      end
    end
  end

  describe 'DELETE destroy' do
    permissions_destroy = {
      'translator' => 403,
      'developer' => 403,
      'manager' => 403,
      'owner' => 200
    }

    it 'responds with json by default' do
      delete '/api/v1/projects/1'
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      delete '/api/v1/projects/1', params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    permissions_destroy.each do |permission, expected_response_status|
      it "#{expected_response_status == 200 ? 'succeeds' : 'fails'} to delete a project as #{permission} of project" do
        project = Project.new(name: 'Project name')
        project.save!

        project_user = ProjectUser.new
        project_user.user_id = @user.id
        project_user.project_id = project.id
        project_user.role = permission
        project_user.save!

        expect do
          delete "/api/v1/projects/#{project.id}", headers: @auth_params, as: :json
        end.to change(Project, :count).by(expected_response_status == 200 ? -1 : 0)

        expect(response.status).to eq(expected_response_status)
        if expected_response_status == 200
          body = JSON.parse(response.body)
          expect(body['message']).to eq('Project deleted')
        end
      end
    end
  end
end
