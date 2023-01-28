require 'rails_helper'

RSpec.describe Plan, type: :model do
  it 'creates a plan' do
    plan = Plan.new
    plan.name = 'plan1'
    plan.permission_system = true
    plan.validations = true
    plan.key_history = true
    plan.export_hierarchy = true
    plan.post_processing = true
    plan.project_activity = true
    plan.over_the_air = true
    plan.tags = true
    plan.machine_translation_suggestions = true
    plan.machine_translation_language = true
    plan.machine_translation_auto_translate = true
    plan.html_editor = true
    plan.save!
  end

  it 'fails to creates a plan with the same name' do
    plan1 = Plan.new
    plan1.name = 'plan1'
    plan1.permission_system = true
    plan1.validations = true
    plan1.key_history = true
    plan1.export_hierarchy = true
    plan1.post_processing = true
    plan1.project_activity = true
    plan1.over_the_air = true
    plan1.tags = true
    plan1.machine_translation_suggestions = true
    plan1.machine_translation_language = true
    plan1.machine_translation_auto_translate = true
    plan1.html_editor = true
    plan1.save!

    plan2 = Plan.new
    plan2.name = 'plan1'
    plan2.permission_system = true
    plan2.validations = true
    plan2.key_history = true
    plan2.export_hierarchy = true
    plan2.post_processing = true
    plan2.project_activity = true
    plan2.over_the_air = true
    plan2.tags = true
    plan2.machine_translation_suggestions = true
    plan2.machine_translation_language = true
    plan2.machine_translation_auto_translate = true
    plan2.html_editor = true
    expect { plan2.save! }.to raise_error(ActiveRecord::RecordNotUnique)
  end
end
