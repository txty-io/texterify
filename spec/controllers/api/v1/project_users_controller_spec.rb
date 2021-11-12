require 'rails_helper'

USER_ATTRIBUTES = [
  'id',
  'username',
  'email',
  'is_superadmin',
  'role',
  'role_source',
  'deactivated',
  'deactivated_reason'
].freeze

RSpec.describe Api::V1::ProjectUsersController, type: :request do
  before(:each) do |test|
    unless test.metadata[:skip_before]
      @user = FactoryBot.create(:user)
      @auth_params = sign_in(@user)
      @project = FactoryBot.create(:project, :with_organization)
      FactoryBot.create(:project_user, project_id: @project.id, user_id: @user.id, role: 'owner')
    end
  end

  describe 'GET index' do
    it 'responds with json by default' do
      get "/api/v1/projects/#{@project.id}/members"
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      get "/api/v1/projects/#{@project.id}/members", params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'has status code 403 if not logged in', :skip_before do
      project = FactoryBot.create(:project, :with_organization)
      get "/api/v1/projects/#{project.id}/members"
      expect(response.status).to eq(403)
    end

    it 'has status code 200 if logged in and returns users' do
      get "/api/v1/projects/#{@project.id}/members", headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(1)
      expect(body['data'][0].keys).to contain_exactly('attributes', 'id', 'type')
      expect(body['data'][0]['attributes'].keys).to contain_exactly(*USER_ATTRIBUTES)
    end

    it 'has status code 200 if logged in and returns users within project organization' do
      organization = FactoryBot.create(:organization)
      project = FactoryBot.create(:project, organization_id: organization.id)
      user1 = FactoryBot.create(:user)
      user2 = FactoryBot.create(:user)
      FactoryBot.create(:organization_user, organization_id: organization.id, user_id: user1.id, role: 'developer')
      FactoryBot.create(:project_user, project_id: project.id, user_id: user2.id, role: 'manager')

      get "/api/v1/projects/#{project.id}/members", headers: sign_in(user1)
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(2)
      expect(
        body['data'].find { |item|
          item['attributes']['role_source'] == 'project' && item['attributes']['role'] == 'manager'
        }
      ).not_to be_nil
      expect(
        body['data'].find { |item|
          item['attributes']['role_source'] == 'organization' && item['attributes']['role'] == 'developer'
        }
      ).not_to be_nil
      expect(body['data'][0].keys).to contain_exactly('attributes', 'id', 'type')
      expect(body['data'][0]['attributes'].keys).to contain_exactly(*USER_ATTRIBUTES)
      expect(body['data'][1].keys).to contain_exactly('attributes', 'id', 'type')
      expect(body['data'][1]['attributes'].keys).to contain_exactly(*USER_ATTRIBUTES)
    end

    it 'has status code 200 if logged in and returns user project role over user organization role' do
      organization = FactoryBot.create(:organization)
      project = FactoryBot.create(:project, organization_id: organization.id)
      user = FactoryBot.create(:user)
      FactoryBot.create(:organization_user, organization_id: organization.id, user_id: user.id, role: 'developer')
      FactoryBot.create(:project_user, project_id: project.id, user_id: user.id, role: 'manager')

      get "/api/v1/projects/#{project.id}/members", headers: sign_in(user)
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['data'].length).to eq(1)
      expect(body['data'][0]['attributes']['role_source']).to eq('project')
      expect(body['data'][0]['attributes']['role']).to eq('manager')
    end
  end

  describe 'PUT update' do
    permissions_update = {
      # current_user_role
      'translator': {
        # role_of_user_to_update
        'translator': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'developer': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'manager': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'owner': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        }
      },
      # current_user_role
      'developer': {
        # role_of_user_to_update
        'translator': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'developer': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'manager': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'owner': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        }
      },
      # current_user_role
      'manager': {
        # role_of_user_to_update
        'translator': {
          'translator': 200,
          'developer': 200,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'developer': {
          'translator': 200,
          'developer': 200,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'manager': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        },
        # role_of_user_to_update
        'owner': {
          'translator': 403,
          'developer': 403,
          'manager': 403,
          'owner': 403
        }
      },
      # current_user_role
      'owner': {
        # role_of_user_to_update
        'translator': {
          'translator': 200,
          'developer': 200,
          'manager': 200,
          'owner': 200
        },
        # role_of_user_to_update
        'developer': {
          'translator': 200,
          'developer': 200,
          'manager': 200,
          'owner': 200
        },
        # role_of_user_to_update
        'manager': {
          'translator': 200,
          'developer': 200,
          'manager': 200,
          'owner': 200
        },
        # role_of_user_to_update
        'owner': {
          'translator': 200,
          'developer': 200,
          'manager': 200,
          'owner': 200
        }
      }
    }

    it 'responds with json by default' do
      user_developer = FactoryBot.create(:user)
      project_user_developer =
        FactoryBot.create(:project_user, project_id: @project.id, user_id: user_developer.id, role: 'developer')
      put "/api/v1/projects/#{@project.id}/members/#{project_user_developer.user_id}"
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'responds with json even by set format' do
      user_developer = FactoryBot.create(:user)
      project_user_developer =
        FactoryBot.create(:project_user, project_id: @project.id, user_id: user_developer.id, role: 'developer')
      put "/api/v1/projects/#{@project.id}/members/#{project_user_developer.user_id}", params: { format: :html }
      expect(response.content_type).to eq 'application/json; charset=utf-8'
    end

    it 'has status code 403 if not logged in', :skip_before do
      project = FactoryBot.create(:project, :with_organization)
      user_developer = FactoryBot.create(:user)
      project_user_developer =
        FactoryBot.create(:project_user, project_id: project.id, user_id: user_developer.id, role: 'developer')
      put "/api/v1/projects/#{project.id}/members/#{project_user_developer.user_id}"
      expect(response.status).to eq(403)
    end

    it 'has status code 400 if no role is given' do
      project = FactoryBot.create(:project, :with_organization)
      user_developer = FactoryBot.create(:user)
      project_user_developer =
        FactoryBot.create(:project_user, project_id: project.id, user_id: user_developer.id, role: 'developer')
      put "/api/v1/projects/#{@project.id}/members/#{project_user_developer.user_id}", headers: @auth_params
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'NO_ROLE_GIVEN' }])
    end

    permissions_update.each do |current_user_role, expected_response_statuses|
      expected_response_statuses.each do |role_of_user_to_update, new_roles_statuses|
        new_roles_statuses.each do |new_role, expected_response_status|
          it "#{expected_response_status == 200 ? 'succeeds' : 'fails'} to update the user project role as #{current_user_role} of a #{role_of_user_to_update} user to #{new_role}" do
            user = FactoryBot.create(:user)
            auth_params = sign_in(user)
            FactoryBot.create(:project_user, project_id: @project.id, user_id: user.id, role: current_user_role)

            other_user = FactoryBot.create(:user)
            project_user = ProjectUser.new
            project_user.user_id = other_user.id
            project_user.project_id = @project.id
            project_user.role = role_of_user_to_update
            project_user.save!

            put "/api/v1/projects/#{@project.id}/members/#{project_user.user_id}",
                params: {
                  role: new_role
                },
                headers: auth_params

            expect(response.status).to eq(expected_response_status)
            if expected_response_status == 200
              body = JSON.parse(response.body)
              expect(body['success']).to eq(true)
            end
          end
        end
      end
    end

    it 'has status code 200 if user has no project permission so far and creates new project user' do
      new_user = FactoryBot.create(:user)
      project_users_count = ProjectUser.all.size
      put "/api/v1/projects/#{@project.id}/members/#{new_user.id}", params: { role: 'developer' }, headers: @auth_params
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['success']).to eq(true)
      expect(ProjectUser.all.size).to eq(project_users_count + 1)
    end

    it 'has status code 400 if last owner role is changed to lower role' do
      put "/api/v1/projects/#{@project.id}/members/#{@user.id}", params: { role: 'developer' }, headers: @auth_params
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'AT_LEAST_ONE_OWNER_PER_PROJECT_REQUIRED' }])
    end

    it 'has status code 400 if user project role is lower than user organization role' do
      organization = FactoryBot.create(:organization)
      @project.organization_id = organization.id
      @project.save!
      user = FactoryBot.create(:user)
      FactoryBot.create(:organization_user, organization_id: organization.id, user_id: user.id, role: 'owner')

      put "/api/v1/projects/#{@project.id}/members/#{user.id}", params: { role: 'developer' }, headers: @auth_params
      expect(response.status).to eq(400)
      body = JSON.parse(response.body)
      expect(body['errors']).to eq([{ 'code' => 'USER_PROJECT_ROLE_LOWER_THAN_USER_ORGANIZATION_ROLE' }])
    end
  end
end
