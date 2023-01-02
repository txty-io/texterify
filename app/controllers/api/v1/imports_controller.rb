class Api::V1::ImportsController < Api::V1::ApiController
  def create
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    import = Import.new
    import.name = params[:files].map { |f| f.original_filename }.join(', ')
    import.user = current_user
    import.project = project
    import.status = 'CREATED'
    import.save!

    params[:files].each do |file|
      import_file = ImportFile.new
      import_file.name = file.original_filename
      import_file.file.attach(file)
      import_file.import = import
      import_file.status = 'CREATED'
      import_file.save!
    end

    if import.save
      options = {}
      options[:include] = [:user]
      render json: ImportSerializer.new(import, options).serialized_json
    else
      render json: { error: true, errors: import.errors.details }, status: :bad_request
    end
  end

  def index
    skip_authorization
    project = current_user.projects.find(params[:project_id])

    page = parse_page(params[:page])
    per_page = parse_per_page(params[:per_page])

    imports = project.imports.order(created_at: :desc)

    options = {}
    options[:meta] = { total: imports.size }
    options[:include] = [:user, :import_files]
    render json: ImportSerializer.new(imports.offset(page * per_page).limit(per_page), options).serialized_json
  end

  def show
    project = current_user.projects.find(params[:project_id])
    import = project.imports.find(params[:id])

    authorize import

    options = {}
    options[:include] = [:user, :import_files]
    render json: ImportSerializer.new(import, options).serialized_json
  end

  def verify
    project = current_user.projects.find(params[:project_id])
    import = project.imports.find(params[:import_id])

    authorize import

    if import.status != IMPORT_STATUS_CREATED
      render json: { error: true, message: 'IMPORT_NOT_IN_CREATED_STATE' }
      return
    end

    # Set the language for the import files.
    file_language_assignments = params[:file_language_assignments]
    missing_language_assignments = []
    import.import_files.each do |import_file|
      language_id = file_language_assignments[import_file.id]
      if language_id.nil?
        missing_language_assignments.push(import_file.id)
      else
        import_file.language = project.languages.find(language_id)
        import_file.save!
      end
    end

    # If for some import files no language has been set throw an error.
    if !missing_language_assignments.empty?
      render json: { error: true, message: 'MISSING_LANGUAGE_ASSIGNMENTS', details: missing_language_assignments }
      return
    end

    # Set the format for the import files.
    file_format_assignments = params[:file_format_assignments]
    missing_format_assignments = []
    import.import_files.each do |import_file|
      file_format_name = file_format_assignments[import_file.id]
      file_format = FileFormat.find_by(format: file_format_name)
      if file_format.nil?
        missing_format_assignments.push(import_file.id)
      else
        import_file.file_format = file_format
        import_file.save!
      end
    end

    # If for some import files no format has been set throw an error.
    if !missing_format_assignments.empty?
      render json: { error: true, message: 'MISSING_FORMAT_ASSIGNMENTS', details: missing_format_assignments }
      return
    end

    # Verify the import.
    background_job = import.verify(current_user)

    render json: { error: false, message: 'VERIFYING', background_job: BackgroundJobSerializer.new(background_job) }
  end

  def review
    project = current_user.projects.find(params[:project_id])
    import = project.imports.find(params[:import_id])

    authorize import

    if import.status != IMPORT_STATUS_VERIFIED
      render json: { error: true, message: 'IMPORT_NOT_IN_VERIFIED_STATE' }
      return
    end

    converted_import_file_translations = {}
    import.import_files.each do |import_file|
      import_file.import_file_translations.each do |import_file_translation|
        if converted_import_file_translations[import_file.language_id].nil?
          converted_import_file_translations[import_file.language_id] = {}
        end

        key = project.keys.find_by(name: import_file_translation.key_name)
        if key
          translation = key.translations.find_by(language_id: import_file.language_id, flavor_id: nil)
        end

        if !key || !translation || import_file_translation.differs_to_translation(translation)
          converted_import_file_translations[import_file.language_id][import_file_translation.key_name] = {
            new_translation: translation.nil?,
            old: {
              other: translation&.content || '',
              zero: translation&.zero || '',
              one: translation&.one || '',
              two: translation&.two || '',
              few: translation&.few || '',
              many: translation&.many || '',
              description: key&.description || ''
            },
            new: {
              other: import_file_translation.other || '',
              zero: import_file_translation.zero || '',
              one: import_file_translation.one || '',
              two: import_file_translation.two || '',
              few: import_file_translation.few || '',
              many: import_file_translation.many || '',
              description: import_file_translation.key_description || ''
            }
          }
        end
      end
    end

    render json: {
             imported_files: ImportFileSerializer.new(import.import_files),
             new_translations: converted_import_file_translations
           }
  end

  def import_files
    project = current_user.projects.find(params[:project_id])
    import = project.imports.find(params[:import_id])

    authorize import

    render json: ImportFileSerializer.new(import.import_files)
  end

  def import
    skip_authorization
    project = current_user.projects.find(params[:project_id])
    import = project.imports.find(params[:import_id])

    authorize import

    if import.status != IMPORT_STATUS_VERIFIED
      render json: { error: true, message: 'IMPORT_NOT_IN_VERIFIED_STATE' }
      return
    end

    # Import the translations.
    background_job = import.import(current_user)

    render json: { error: false, message: 'VERIFYING', background_job: BackgroundJobSerializer.new(background_job) }
  end

  def destroy_multiple
    project = current_user.projects.find(params[:project_id])

    imports_to_destroy = project.imports.find(params[:import_ids])
    imports_to_destroy.each { |import| authorize import }

    project.imports.destroy(imports_to_destroy)

    render json: { error: false, message: 'FLAVORS_DELETED' }
  end
end
