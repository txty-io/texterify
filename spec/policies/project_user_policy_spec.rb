require 'rails_helper'

RSpec.describe ProjectUserPolicy do
  let(:user) { instance_double(User) }
  let(:project) { instance_double(Project) }
  let(:actor_role) { ROLE_MANAGER }
  let(:target_role) { ROLE_TRANSLATOR }
  let(:previous_role) { nil }
  let(:project_user) do
    instance_double(ProjectUser, project: project, role: target_role, role_before_update: previous_role)
  end
  let(:policy) { described_class.new(user, project_user) }

  before(:each) { allow(project).to receive(:role_of).with(user).and_return(actor_role) }

  %i[create? update? destroy?].each do |action|
    describe "##{action}" do
      subject(:authorized) { policy.public_send(action) }

      it 'allows a manager to manage a lower role' do
        expect(authorized).to be(true)
      end

      context 'when the requested role equals the manager role' do
        let(:target_role) { ROLE_MANAGER }
        let(:previous_role) { ROLE_TRANSLATOR }

        it 'denies the action' do
          expect(authorized).to be(false)
        end
      end

      context 'when the target previously had a higher role' do
        let(:previous_role) { ROLE_OWNER }

        it 'denies the action even if the requested role is lower' do
          expect(authorized).to be(false)
        end
      end

      context 'when the actor is not a manager' do
        let(:actor_role) { ROLE_DEVELOPER }

        it 'denies the action' do
          expect(authorized).to be(false)
        end
      end

      context 'when the actor is an owner' do
        let(:actor_role) { ROLE_OWNER }
        let(:target_role) { ROLE_OWNER }
        let(:previous_role) { ROLE_OWNER }

        it 'allows the action regardless of the target roles' do
          expect(authorized).to be(true)
        end
      end
    end
  end
end
