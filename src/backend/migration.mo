import Map "mo:core/Map";

module {
  // Old Assessment type (before fileUrl was added)
  type OldAssessment = {
    id : Nat;
    title : Text;
    subject : Text;
    classLevel : Text;
    date : Int;
    description : Text;
    timestamp : Int;
  };

  // New Assessment type (with optional fileUrl)
  type NewAssessment = {
    id : Nat;
    title : Text;
    subject : Text;
    classLevel : Text;
    date : Int;
    description : Text;
    timestamp : Int;
    fileUrl : ?Text;
  };

  type OldActor = {
    assessments : Map.Map<Nat, OldAssessment>;
  };

  type NewActor = {
    assessments : Map.Map<Nat, NewAssessment>;
  };

  public func run(old : OldActor) : NewActor {
    let assessments = old.assessments.map<Nat, OldAssessment, NewAssessment>(
      func(_id, a) { { a with fileUrl = null } }
    );
    { assessments };
  };
};
